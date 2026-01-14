import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { useToast } from './use-toast';

interface CallLimits {
  calls_used: number;
  max_calls: number;
}

export const useCallLimits = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const [limits, setLimits] = useState<CallLimits | null>(null);
  const [loading, setLoading] = useState(true);

  const isSubscribed = subscription && subscription.status === 'active';
  const BOOKING_FEE = 200; // 2 rupees in paisa

  useEffect(() => {
    if (user && !isSubscribed) {
      fetchCallLimits();
    } else {
      setLimits(null);
      setLoading(false);
    }
  }, [user, isSubscribed]);

  const fetchCallLimits = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_call_limits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLimits({
          calls_used: data.calls_used,
          max_calls: data.max_calls,
        });
      } else {
        // Create initial record
        const { data: newData, error: insertError } = await supabase
          .from('user_call_limits')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        setLimits({
          calls_used: newData.calls_used,
          max_calls: newData.max_calls,
        });
      }
    } catch (error) {
      console.error('Error fetching call limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const canScheduleCall = (): boolean => {
    // Subscribed users have unlimited calls
    if (isSubscribed) return true;

    // Non-subscribed users are limited
    if (limits && limits.calls_used >= limits.max_calls) {
      return false;
    }
    return true;
  };

  const getRemainingCalls = (): number => {
    if (isSubscribed) return Infinity;
    if (!limits) return 3;
    return limits.max_calls - limits.calls_used;
  };

  const incrementCallCount = async (): Promise<boolean> => {
    if (!user) return false;

    // Subscribed users don't need to track calls
    if (isSubscribed) return true;

    if (!canScheduleCall()) {
      toast({
        title: "Call Limit Reached",
        description: "You've used all 3 free calls. Subscribe to a plan for unlimited calls.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const newCount = (limits?.calls_used || 0) + 1;
      const { error } = await supabase
        .from('user_call_limits')
        .update({ calls_used: newCount })
        .eq('user_id', user.id);

      if (error) throw error;

      setLimits(prev => prev ? { ...prev, calls_used: newCount } : null);
      return true;
    } catch (error) {
      console.error('Error incrementing call count:', error);
      return false;
    }
  };

  const createBookingPayment = async (bookingId: string): Promise<boolean> => {
    if (!user) return false;

    // Subscribed users don't pay booking fees
    if (isSubscribed) return true;

    try {
      const { error } = await supabase
        .from('booking_payments')
        .insert({
          user_id: user.id,
          booking_id: bookingId,
          amount: BOOKING_FEE,
          payment_type: 'booking_fee',
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Booking Fee",
        description: "A ₹2 booking fee has been added. Pay to finalize your booking.",
      });
      return true;
    } catch (error) {
      console.error('Error creating booking payment:', error);
      return false;
    }
  };

  return {
    limits,
    loading,
    isSubscribed,
    canScheduleCall,
    getRemainingCalls,
    incrementCallCount,
    createBookingPayment,
    bookingFee: BOOKING_FEE / 100, // Return in rupees
  };
};
