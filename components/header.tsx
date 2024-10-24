"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useCredits } from '@/hooks/use-credits';
import Link from 'next/link';

export function Header() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { credits } = useCredits();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Research AI
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/pricing">
            <Button variant="outline">
              Buy Credits ({credits})
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}