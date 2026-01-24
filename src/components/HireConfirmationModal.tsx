import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CheckCircle, Loader2, Briefcase, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Worker {
  id: string;
  name: string;
  phone: string;
  work_type: string;
  years_experience: number | null;
}

interface HireConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  worker: Worker | null;
  serviceName: string;
  loading?: boolean;
}

export const HireConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  worker,
  serviceName,
  loading = false,
}: HireConfirmationModalProps) => {
  if (!isOpen || !worker) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-card rounded-3xl shadow-elevated max-w-md w-full p-6 z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Confirm Hiring
            </h2>
            <p className="text-muted-foreground">
              You're about to permanently hire this worker
            </p>
          </div>

          {/* Worker Info */}
          <div className="bg-muted/50 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">{worker.name}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {worker.work_type?.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {worker.years_experience || 0} yrs exp
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service */}
          <p className="text-sm text-center text-muted-foreground mb-6">
            For <span className="font-medium text-foreground">{serviceName}</span> service
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="hero"
              className="flex-1 gap-2"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Hiring...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm Hire
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
