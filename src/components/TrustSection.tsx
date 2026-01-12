import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Fingerprint, FileCheck, BadgeCheck } from 'lucide-react';

const verificationSteps = [
  { icon: Fingerprint, label: 'ID Verified', description: 'Aadhaar & identity proof checked' },
  { icon: FileCheck, label: 'Background Check', description: 'Police verification completed' },
  { icon: BadgeCheck, label: 'Skills Assessed', description: 'Work quality verified' },
  { icon: CheckCircle2, label: 'Reference Check', description: 'Past employer feedback collected' },
];

export const TrustSection = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-secondary/5 via-background to-primary/5 overflow-hidden">
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Trust & Safety</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              100% Verified <span className="text-gradient">Workers</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Your family's safety is our top priority. Every worker on our platform goes through a rigorous 
              4-step verification process before they can be matched with you.
            </p>

            {/* Verification Steps */}
            <div className="space-y-4">
              {verificationSteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-card rounded-xl shadow-soft"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{step.label}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-secondary/10 to-primary/10 rounded-3xl p-8 md:p-12">
              {/* Central Badge */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-40 h-40 mx-auto bg-card rounded-full shadow-elevated flex items-center justify-center mb-8"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center">
                  <Shield className="w-16 h-16 text-secondary-foreground" />
                </div>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl p-5 text-center shadow-soft"
                >
                  <p className="text-3xl font-bold text-primary mb-1">5,000+</p>
                  <p className="text-sm text-muted-foreground">Verified Workers</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-card rounded-2xl p-5 text-center shadow-soft"
                >
                  <p className="text-3xl font-bold text-secondary mb-1">10,000+</p>
                  <p className="text-sm text-muted-foreground">Happy Families</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="bg-card rounded-2xl p-5 text-center shadow-soft"
                >
                  <p className="text-3xl font-bold text-success mb-1">4.9★</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="bg-card rounded-2xl p-5 text-center shadow-soft"
                >
                  <p className="text-3xl font-bold text-accent-foreground mb-1">50+</p>
                  <p className="text-sm text-muted-foreground">Cities Covered</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
