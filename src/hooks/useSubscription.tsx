import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  plan_price: number;
  status: string;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (planName: string, planPrice: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe to a plan.",
        variant: "destructive",
      });
      return false;
    }

    setSubscribing(true);
    try {
      // Cancel any existing active subscription
      if (subscription) {
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', subscription.id);
      }

      // Create new subscription with 7-day trial
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_name: planName,
          plan_price: planPrice,
          status: 'active',
          trial_ends_at: trialEndsAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSubscription(data);
      toast({
        title: "🎉 Demo Subscription Active!",
        description: `You've subscribed to the ${planName} plan. This is a test environment - no real payment was made.`,
      });
      return true;
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubscribing(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return false;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscription.id);

      if (error) throw error;

      setSubscription(null);
      toast({
        title: "Subscription Cancelled",
        description: "Your demo subscription has been cancelled.",
      });
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Cancellation Failed",
        description: "There was an error cancelling your subscription.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    subscription,
    loading,
    subscribing,
    subscribe,
    cancelSubscription,
    refetch: fetchSubscription,
  };
};
