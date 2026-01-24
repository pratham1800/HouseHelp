import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SubscriptionPlans } from './SubscriptionPlans';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribed?: () => void;
}

export const SubscriptionModal = ({
  isOpen,
  onClose,
  onSubscribed,
}: SubscriptionModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-background rounded-3xl shadow-elevated max-w-7xl w-full max-h-[90vh] overflow-y-auto z-10 my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content - Using the existing SubscriptionPlans component */}
          <div className="pt-8">
            <SubscriptionPlans />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
