import { ChatInterface } from '@/components/chat-interface';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      <div className="container flex flex-col items-center justify-center gap-4 px-4 py-16">
        <ChatInterface />
      </div>
    </main>
  );
}