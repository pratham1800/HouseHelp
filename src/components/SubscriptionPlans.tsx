import { motion } from 'framer-motion';
import { Check, Star, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Standard',
    price: '499',
    description: 'Perfect for getting started',
    features: [
      'Verified worker matching',
      '7-day free trial period',
      'Basic customer support',
      'Monthly billing',
    ],
    notIncluded: [
      'Backup worker on leave',
      'Priority matching',
      'Dedicated support manager',
    ],
    popular: false,
    buttonVariant: 'outline' as const,
  },
  {
    name: 'Premium',
    price: '999',
    description: 'Best value for families',
    features: [
      'Everything in Standard',
      'Backup worker when main is on leave',
      'Priority worker matching',
      'Dedicated support manager',
      '24/7 emergency support',
      'Free replacement guarantee',
    ],
    notIncluded: [],
    popular: true,
    buttonVariant: 'hero' as const,
  },
];

export const SubscriptionPlans = () => {
  return (
    <section id="subscription" className="section-padding bg-background">
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
            Subscription Plans
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that works best for your family. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative rounded-3xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-2 border-primary/20 shadow-elevated'
                  : 'bg-card shadow-card'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent px-4 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="text-sm font-semibold text-white">Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-lg text-muted-foreground">₹</span>
                  <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 opacity-50">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-muted-foreground">✕</span>
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button variant={plan.buttonVariant} size="lg" className="w-full">
                {plan.popular ? 'Get Premium' : 'Get Started'}
              </Button>

              {/* Premium Extras */}
              {plan.popular && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
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
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          * One-time matching fee applies. Worker salary is paid directly to the worker.
        </motion.p>
      </div>
    </section>
  );
};
