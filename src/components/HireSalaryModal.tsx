import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, IndianRupee, Calendar, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Worker {
  id: string;
  name: string;
  phone: string;
  work_type: string;
  years_experience: number | null;
}

interface HireSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (salary: number, frequency: string) => void;
  worker: Worker | null;
  serviceName: string;
  loading: boolean;
}

export const HireSalaryModal = ({
  isOpen,
  onClose,
  onConfirm,
  worker,
  serviceName,
  loading
}: HireSalaryModalProps) => {
  const [salary, setSalary] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('monthly');

  const handleConfirm = () => {
    const salaryAmount = parseInt(salary, 10);
    if (salaryAmount > 0) {
      onConfirm(salaryAmount, frequency);
    }
  };

  const isValid = salary && parseInt(salary, 10) > 0;

  if (!isOpen || !worker) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-background rounded-2xl shadow-elevated w-full max-w-md z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
            disabled={loading}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Confirm Hiring</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Set salary details for your new employee
              </p>
            </div>

            {/* Worker Info */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{worker.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {worker.work_type?.replace('_', ' ')} • {worker.years_experience || 0} yrs exp
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Service: {serviceName}</span>
              </div>
            </div>

            {/* Salary Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="salary">Agreed Salary (₹)</Label>
                <div className="relative mt-1.5">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="salary"
                    type="number"
                    placeholder="e.g., 15000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="frequency">Payment Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency} disabled={loading}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mt-6">
              <p className="text-xs text-muted-foreground">
                ℹ️ The worker will be added to your "My Employees" section where you can track attendance, leaves, and manage their profile.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
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
                onClick={handleConfirm}
                disabled={!isValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Hiring...
                  </>
                ) : (
                  'Confirm Hire'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
