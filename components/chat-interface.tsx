"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';
import { useCredits } from '@/hooks/use-credits';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  noAuth?: boolean;
  credits?: number;
  onCreditUse?: () => void;
}

export function ChatInterface({ noAuth, credits: noAuthCredits, onCreditUse }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { credits, deductCredits } = useCredits();

  const availableCredits = noAuth ? noAuthCredits : credits;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (availableCredits < 1) {
      toast({
        title: "No credits remaining",
        description: noAuth 
          ? "Please sign in to get more credits." 
          : "Please purchase more credits to continue using the service.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          noAuth: noAuth 
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      if (noAuth) {
        onCreditUse?.();
      } else {
        await deductCredits(1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="text-center mb-8">
        <p className="text-muted-foreground">
          Credits remaining: {availableCredits}
        </p>
      </div>

      <div className="space-y-4 mb-4 h-[60vh] overflow-y-auto p-4 rounded-lg border">
        {messages.map((message, i) => (
          <Card key={i} className={`p-4 ${message.role === 'assistant' ? 'bg-muted' : 'bg-background'}`}>
            <ReactMarkdown className="prose dark:prose-invert max-w-none">
              {message.content}
            </ReactMarkdown>
          </Card>
        ))}
        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a research question..."
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}