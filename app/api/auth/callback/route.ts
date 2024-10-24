import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

    // If this is a guest login (via GitHub), mark the user as a guest
    if (user && user.app_metadata.provider === 'github') {
      await supabase.auth.updateUser({
        data: { is_guest: true }
      });
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin));
}