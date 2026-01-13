import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  offsetBottom?: boolean;
}

export const WhatsAppButton = ({ offsetBottom = false }: WhatsAppButtonProps) => {
  const phoneNumber = '919876543210'; // Replace with actual number
  const message = encodeURIComponent('Hi! I want to know more about GharSeva home help services.');

  return (
    <motion.a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: offsetBottom ? -80 : 0 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-whatsapp text-whatsapp-foreground px-5 py-3 rounded-full shadow-elevated hover:shadow-card transition-shadow"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.div>
      <span className="font-semibold hidden sm:inline">Chat with us</span>
    </motion.a>
  );
};
