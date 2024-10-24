"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';

export function useCredits() {
  const [credits, setCredits] = useState(0);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('credits')
        .select('amount')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCredits(data?.amount || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const deductCredits = async (amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('deduct_credits', {
        deduct_amount: amount,
        user_id: user.id
      });

      if (error) throw error;
      await fetchCredits();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deduct credits",
        variant: "destructive"
      });
    }
  };

  const addCredits = async (amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('add_credits', {
        add_amount: amount,
        user_id: user.id
      });

      if (error) throw error;
      await fetchCredits();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add credits",
        variant: "destructive"
      });
    }
  };

  return { credits, deductCredits, addCredits, refreshCredits: fetchCredits };
}