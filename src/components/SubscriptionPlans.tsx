import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Shield, RefreshCw, Loader2, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from './AuthModal';

const plans = [
  {
    name: 'Light',
    price: 299,
    description: 'Perfect for single worker management',
    features: [
      '1 active worker management',
      'Worker verification & background check',
      '3-day trial period',
      'Up to 2 replacements per year',
      'Basic customer support',
      'Worker attendance dashboard',
    ],
    notIncluded: [
      'Multiple workers',
      'Performance reports',
      'Substitute worker on leave',
    ],
    popular: false,
    buttonVariant: 'outline' as const,
  },
  {
    name: 'Standard',
    price: 499,
    description: 'Ideal for managing 2 workers',
    features: [
      'Up to 2 active workers',
      'Worker verification & background check',
      '3-day trial period',
      'Up to 2 replacements per year',
      'Basic customer support',
      'Worker attendance dashboard',
      'Monthly performance reports',
    ],
    notIncluded: [
      'Substitute worker on leave',
      'More than 2 workers',
    ],
    popular: false,
    buttonVariant: 'outline' as const,
  },
  {
    name: 'Standard+',
    price: 899,
    description: 'Enhanced support with backup workers',
    features: [
      'Up to 2 active workers',
      'Worker verification & background check',
      '3-day trial period',
      'Up to 2 replacements per year',
      'Basic customer support',
      'Worker attendance dashboard',
      'Monthly performance reports',
      'Substitute worker when maid is on leave',
    ],
    notIncluded: [
      'More than 2 workers',
    ],
    popular: true,
    buttonVariant: 'hero' as const,
  },
  {
    name: 'Premium',
    price: 1299,
    description: 'Complete solution for larger households',
    features: [
      'Up to 3 active workers',
      'Worker verification & background check',
      '3-day trial period',
      'Up to 2 replacements per year',
      'Basic customer support',
      'Worker attendance dashboard',
      'Monthly performance reports',
      'Substitute worker when maid is on leave',
    ],
    notIncluded: [],
    popular: false,
    buttonVariant: 'outline' as const,
  },
];

interface SubscriptionPlansProps {
  compact?: boolean;
}

export const SubscriptionPlans = ({ compact = false }: SubscriptionPlansProps) => {
  const { user } = useAuth();
  const { subscription, subscribing, subscribe } = useSubscription();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<{ name: string; price: number } | null>(null);

  const handleSubscribe = async (planName: string, planPrice: number) => {
    if (!user) {
      setPendingPlan({ name: planName, price: planPrice });
      setShowAuthModal(true);
      return;
    }

    await subscribe(planName, planPrice);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    if (pendingPlan) {
      // Wait a moment for auth state to settle
      setTimeout(() => {
        subscribe(pendingPlan.name, pendingPlan.price);
        setPendingPlan(null);
      }, 500);
    }
  };

  const isCurrentPlan = (planName: string) => {
    return subscription?.plan_name === planName && subscription?.status === 'active';
  };

  return (
    <section id="subscription" className={compact ? "py-2" : "section-padding bg-background"}>
      <div className={compact ? "px-2" : "container-main"}>
        {/* Demo Mode Banner - Hide in compact mode */}
        {!compact && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Demo Mode</span>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Test subscriptions freely - no real payments will be processed
            </p>
          </motion.div>
        )}

        {/* Current Subscription Status - Hide in compact mode */}
        {!compact && subscription && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-center gap-3">
              <Crown className="w-6 h-6 text-primary" />
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  You're subscribed to <span className="text-primary">{subscription.plan_name}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Trial ends: {new Date(subscription.trial_ends_at || '').toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-center ${compact ? 'mb-6' : 'mb-12 md:mb-16'}`}
        >
          {!compact && (
            <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
              Subscription Plans
            </span>
          )}
          <h2 className={`font-bold text-foreground mb-2 ${compact ? 'text-xl sm:text-2xl' : 'text-3xl md:text-4xl lg:text-5xl mb-4'}`}>
            {compact ? 'Choose a Plan to Hire' : <>Simple, Transparent <span className="text-gradient">Pricing</span></>}
          </h2>
          <p className={`text-muted-foreground ${compact ? 'text-sm' : 'text-lg'} max-w-2xl mx-auto`}>
            {compact ? 'Subscribe to permanently hire your worker' : 'Choose the plan that works best for your family. Upgrade or downgrade anytime.'}
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className={`grid gap-4 ${compact ? 'grid-cols-2 lg:grid-cols-4 max-w-6xl' : 'md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl'} mx-auto`}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl ${compact ? 'p-4' : 'p-8'} flex flex-col ${
                plan.popular
                  ? 'bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-2 border-primary/20 shadow-elevated'
                  : 'bg-card shadow-card'
              } ${isCurrentPlan(plan.name) ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
              {/* Current Plan Badge */}
              {isCurrentPlan(plan.name) && (
                <div className="absolute -top-3 -right-3">
                  <div className="flex items-center gap-1 bg-primary px-3 py-1 rounded-full">
                    <Check className="w-3 h-3 text-primary-foreground" />
                    <span className="text-xs font-semibold text-primary-foreground">Current</span>
                  </div>
                </div>
              )}

              {/* Popular Badge */}
              {plan.popular && !isCurrentPlan(plan.name) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent px-4 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="text-sm font-semibold text-white">Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className={`text-center ${compact ? 'mb-4' : 'mb-8'}`}>
                <h3 className={`font-bold text-foreground ${compact ? 'text-lg mb-1' : 'text-2xl mb-2'}`}>{plan.name}</h3>
                {!compact && <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>}
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-muted-foreground ${compact ? 'text-sm' : 'text-lg'}`}>₹</span>
                  <span className={`font-bold text-foreground ${compact ? 'text-3xl' : 'text-5xl'}`}>{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>
              </div>

              {/* Features - Show limited in compact mode */}
              <div className={`space-y-2 ${compact ? 'mb-4' : 'mb-8'} flex-grow`}>
                {(compact ? plan.features.slice(0, 3) : plan.features).map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <div className={`rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`}>
                      <Check className={`text-success ${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
                    </div>
                    <span className={`text-foreground ${compact ? 'text-xs' : 'text-sm'}`}>{feature}</span>
                  </div>
                ))}
                {compact && plan.features.length > 3 && (
                  <p className="text-xs text-muted-foreground pl-6">+{plan.features.length - 3} more</p>
                )}
                {!compact && plan.notIncluded.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 opacity-50">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-muted-foreground">✕</span>
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-auto">
                <Button 
                  variant={plan.buttonVariant} 
                  size={compact ? "sm" : "lg"}
                  className="w-full"
                  disabled={subscribing || isCurrentPlan(plan.name)}
                  onClick={() => handleSubscribe(plan.name, plan.price)}
                >
                  {subscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan(plan.name) ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Current Plan
                    </>
                  ) : subscription ? (
                    `Switch to ${plan.name}`
                  ) : (
                    plan.popular ? `Get ${plan.name}` : `Get ${plan.name}`
                  )}
                </Button>

                {/* Premium Extras - Hide in compact mode */}
                {!compact && (
                  <div className={`flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border ${(plan.popular || plan.name === 'Premium') ? '' : 'invisible'}`}>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-secondary" />
                      <span>Safe</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <RefreshCw className="w-4 h-4 text-primary" />
                      <span>Backup</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note - Hide in compact mode */}
        {!compact && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            * One-time matching fee applies. Worker salary is paid directly to the worker.
          </motion.p>
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          setShowAuthModal(false);
          setPendingPlan(null);
        }}
        defaultMode="signup"
      />
    </section>
  );
};
