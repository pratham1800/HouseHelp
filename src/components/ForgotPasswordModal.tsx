import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleBackToLogin = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onBackToLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {success ? (
              // Success State
              <div className="px-8 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your inbox and follow the instructions.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <div className="space-y-3">
                  <Button onClick={handleBackToLogin} className="w-full" variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                  <Button 
                    onClick={() => setSuccess(false)} 
                    variant="ghost" 
                    className="w-full"
                  >
                    Try a different email
                  </Button>
                </div>
              </div>
            ) : (
              // Form State
              <>
                <div className="px-8 pt-8 pb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-center text-foreground">
                    Forgot Password?
                  </h2>
                  <p className="text-muted-foreground text-center mt-2">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                <div className="px-8 pb-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="reset-email" className="text-foreground">Email</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {error && (
                        <p className="text-destructive text-sm mt-1">{error}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>

                  <p className="text-center text-muted-foreground mt-6">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="text-primary hover:underline font-medium"
                    >
                      Back to Login
                    </button>
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
