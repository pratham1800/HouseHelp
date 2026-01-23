import { motion } from 'framer-motion';
import { Shield, RefreshCw, Clock, BadgeCheck, Users, HeartHandshake } from 'lucide-react';

const features = [
  {
    icon: BadgeCheck,
    title: '100% Verified Workers',
    description: 'Every worker undergoes thorough ID verification and background checks',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    icon: Clock,
    title: '3-Day Free Trial',
    description: 'Test the match. Not satisfied? Choose another worker at no extra cost',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: RefreshCw,
    title: 'Backup Guarantee',
    description: 'Premium members get substitute workers when regular help is on leave',
    color: 'text-accent-foreground',
    bgColor: 'bg-accent/20',
  },
  {
    icon: Users,
    title: 'Personal Matching',
    description: 'We match you with workers based on your specific household needs',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    icon: HeartHandshake,
    title: 'Simple Process',
    description: 'Book in 3 simple steps. As easy as messaging on WhatsApp',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Your family\'s safety is our priority. Trusted by 10,000+ families',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
            Why GharSeva?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Your Peace of Mind, <span className="text-gradient">Guaranteed</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We handle the difficult parts so you can focus on what matters most — your family.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-card rounded-2xl p-6 md:p-8 shadow-soft hover:shadow-card transition-all duration-300"
            >
              <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-5`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
