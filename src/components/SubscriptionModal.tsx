import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SubscriptionPlans } from './SubscriptionPlans';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelected?: (planName: string, planPrice: number) => void;
}

export const SubscriptionModal = ({
  isOpen,
  onClose,
  onPlanSelected,
}: SubscriptionModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative bg-background rounded-2xl shadow-elevated w-[95vw] max-w-5xl z-10 my-4 sm:my-8 mx-2"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content - Compact version */}
          <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
            <SubscriptionPlans compact onPlanSelected={onPlanSelected} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
