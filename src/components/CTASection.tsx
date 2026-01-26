import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CTASection = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-primary via-primary to-secondary overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

      <div className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Experience Hassle-Free Home Help?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join 10,000+ happy families who trust GharSeva for their everyday home needs. 
            Start with a 3-day free trial today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              className="bg-white text-primary hover:bg-white/90 font-bold shadow-elevated"
            >
              Book Now
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="whatsapp"
              size="xl"
              className="font-bold"
              onClick={() => window.open('https://wa.me/919876543210?text=Hi! I want to know more about GharSeva home help services.', '_blank')}
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
