-- Enable RLS
alter table auth.users enable row level security;

-- Create credits table
create table public.credits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null unique,
  amount integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on credits table
alter table public.credits enable row level security;

-- Create RLS policies for credits table
create policy "Users can view their own credits"
  on public.credits for select
  using (auth.uid() = user_id);

create policy "System can insert credits for users"
  on public.credits for insert
  with check (true);

create policy "System can update user credits"
  on public.credits for update
  using (true);

-- Create function to add credits
create or replace function public.add_credits(
  add_amount integer,
  user_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.credits (user_id, amount)
  values (user_id, add_amount)
  on conflict (user_id)
  do update set
    amount = credits.amount + add_amount,
    updated_at = now();
end;
$$;

-- Create function to deduct credits
create or replace function public.deduct_credits(
  deduct_amount integer,
  user_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  current_credits integer;
begin
  -- Get current credits
  select amount into current_credits
  from public.credits
  where credits.user_id = deduct_credits.user_id;

  -- Check if user has enough credits
  if current_credits is null or current_credits < deduct_amount then
    raise exception 'Insufficient credits';
  end if;

  -- Deduct credits
  update public.credits
  set
    amount = amount - deduct_amount,
    updated_at = now()
  where credits.user_id = deduct_credits.user_id;
end;
$$;

-- Create trigger to initialize credits for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Give different amounts of initial credits based on user metadata
  if (new.raw_user_meta_data->>'is_guest')::boolean then
    -- Guest users get 2 credits
    insert into public.credits (user_id, amount)
    values (new.id, 2);
  else
    -- Regular users get 5 credits
    insert into public.credits (user_id, amount)
    values (new.id, 5);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();