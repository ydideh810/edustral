"use client";

import { ChatInterface } from '@/components/chat-interface';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NoAuthPage() {
  const router = useRouter();
  const [creditsUsed, setCreditsUsed] = useState(0);
  const totalFreeCredits = 2;

  const handleCreditUse = () => {
    setCreditsUsed(prev => prev + 1);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      <div className="w-full border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Research AI</h1>
          <Button variant="outline" onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
      </div>
      
      <div className="container flex flex-col items-center justify-center gap-4 px-4 py-16">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Try Research AI</h2>
            <p className="text-muted-foreground">
              You have {totalFreeCredits - creditsUsed} free messages remaining. Sign in to get more credits.
            </p>
          </div>
          <ChatInterface 
            noAuth 
            credits={totalFreeCredits - creditsUsed}
            onCreditUse={handleCreditUse}
          />
        </div>
      </div>
    </main>
  );
}