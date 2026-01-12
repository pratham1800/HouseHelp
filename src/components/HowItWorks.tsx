import { motion } from 'framer-motion';
import { Search, ClipboardCheck, Users, Calendar, ThumbsUp } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Choose Service',
    description: 'Select the type of help you need — cleaning, cooking, driver, or gardener',
    color: 'from-primary to-orange-400',
  },
  {
    number: '02',
    icon: ClipboardCheck,
    title: 'Share Requirements',
    description: 'Tell us about your home, timing preferences, and any special needs',
    color: 'from-secondary to-teal-400',
  },
  {
    number: '03',
    icon: Users,
    title: 'Get Matched',
    description: 'We show you 5 best-matched verified workers to choose from',
    color: 'from-accent to-yellow-400',
  },
  {
    number: '04',
    icon: Calendar,
    title: 'Schedule & Meet',
    description: 'Schedule a call, meet your helper, and start the 7-day trial',
    color: 'from-primary to-orange-400',
  },
  {
    number: '05',
    icon: ThumbsUp,
    title: 'Confirm & Relax',
    description: 'Happy with the match? Confirm and enjoy hassle-free home help!',
    color: 'from-success to-emerald-400',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding bg-background">
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Getting reliable home help is as easy as ordering food online. Just 5 simple steps.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-success opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center group"
              >
                {/* Step Number & Icon Container */}
                <div className="relative inline-block mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} shadow-card flex items-center justify-center mx-auto`}
                  >
                    <step.icon className="w-9 h-9 text-white" />
                  </motion.div>
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-card rounded-full shadow-soft flex items-center justify-center border-2 border-background">
                    <span className="text-xs font-bold text-foreground">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                {/* Arrow for desktop - between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-24 -right-3 w-6 h-6 text-muted-foreground/30">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
