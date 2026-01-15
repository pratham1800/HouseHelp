import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function WorkerAuth() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSwitchOption, setShowSwitchOption] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingWorkerProfile, setExistingWorkerProfile] = useState(false);
  const [ownerData, setOwnerData] = useState<{ full_name: string; phone: string; address: string } | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);

  // Check if user is already logged in and if they have existing profiles
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user && !authLoading) {
        // Check if user already has a worker profile
        const { data: workerAuth } = await supabase
          .from('worker_auth')
          .select('worker_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (workerAuth?.worker_id) {
          setExistingWorkerProfile(true);
        }

        // Fetch owner profile data for potential migration
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, address')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setOwnerData({
            full_name: profile.full_name || user.user_metadata?.full_name || '',
            phone: profile.phone || '',
            address: profile.address || ''
          });
        }

        setShowSwitchOption(true);
      }
    };

    checkUserStatus();
  }, [user, authLoading]);

  const handleContinueAsWorker = async () => {
    if (!user) return;
    
    setMigrationLoading(true);

    try {
      // Check if worker profile already exists
      const { data: existingWorkerAuth } = await supabase
        .from('worker_auth')
        .select('worker_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingWorkerAuth?.worker_id) {
        // Worker profile exists, just update role and navigate
        await supabase
          .from('profiles')
          .update({ user_role: 'worker' })
          .eq('id', user.id);
        
        navigate('/for-workers/dashboard');
        return;
      }

      // Create new worker profile with default stats
      const { data: newWorker, error: workerError } = await supabase
        .from('workers')
        .insert({
          name: ownerData?.full_name || user.user_metadata?.full_name || 'Worker',
          phone: ownerData?.phone || '',
          work_type: 'domestic_help', // Default, can be updated later
          years_experience: 0,
          languages_spoken: [],
          preferred_areas: [],
          working_hours: 'full_day',
          residential_address: ownerData?.address || '',
          status: 'pending_verification',
          match_score: 0
        })
        .select('id')
        .single();

      if (workerError) throw workerError;

      // Link user to worker profile
      const { error: linkError } = await supabase
        .from('worker_auth')
        .insert({
          user_id: user.id,
          worker_id: newWorker.id,
          migrated_from_owner: true,
          migrated_at: new Date().toISOString()
        });

      if (linkError) throw linkError;

      // Update profile role
      await supabase
        .from('profiles')
        .update({ user_role: 'worker' })
        .eq('id', user.id);

      toast({
        title: 'Worker Profile Created!',
        description: 'Your worker account has been initialized. Please complete your verification.',
      });

      navigate('/for-workers/verification');
    } catch (error: any) {
      console.error('Migration error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create worker profile',
        variant: 'destructive',
      });
    } finally {
      setMigrationLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    await signOut();
    setShowSwitchOption(false);
    setExistingWorkerProfile(false);
    setOwnerData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (mode === 'login') {
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          const fieldErrors: Record<string, string> = {};
          validation.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message.includes('Invalid login credentials') 
              ? 'Invalid email or password.' 
              : error.message,
            variant: 'destructive',
          });
        } else {
          // User will be redirected via useEffect when user state updates
          toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
        }
      } else {
        const validation = signupSchema.safeParse({ fullName, email, password });
        if (!validation.success) {
          const fieldErrors: Record<string, string> = {};
          validation.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: error.message.includes('User already registered') ? 'Account Exists' : 'Sign Up Failed',
            description: error.message.includes('User already registered')
              ? 'An account with this email already exists. Please login instead.'
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome to GharSeva!',
            description: 'Your worker account has been created. Complete your profile to get started.',
          });
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: 'Google Sign In Failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show option to continue or switch account if user is already logged in
  if (showSwitchOption && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/5 via-background to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/for-workers')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Worker Portal
          </Button>

          <div className="bg-card rounded-2xl shadow-elevated overflow-hidden p-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">
              {existingWorkerProfile ? 'Worker Account Found' : 'Already Signed In'}
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              You're signed in as <strong>{user.email}</strong>
            </p>

            {existingWorkerProfile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 mb-4">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">You already have a worker profile</span>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/for-workers/dashboard')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Go to Worker Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg mb-4">
                  <h3 className="font-medium text-foreground mb-2">Create Worker Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Your owner account data will be used to pre-fill your worker registration:
                  </p>
                  {ownerData && (
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      {ownerData.full_name && <li>• Name: {ownerData.full_name}</li>}
                      {ownerData.phone && <li>• Phone: {ownerData.phone}</li>}
                      {ownerData.address && <li>• Address: {ownerData.address}</li>}
                    </ul>
                  )}
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleContinueAsWorker}
                  disabled={migrationLoading}
                >
                  {migrationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-4 h-4 mr-2" />
                      Continue as Worker
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={handleSwitchAccount}
            >
              Switch to Different Account
            </Button>

            <p className="text-center text-muted-foreground mt-6 text-sm">
              Looking to hire help?{' '}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-primary hover:underline font-medium"
              >
                Go to Owner Portal
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/5 via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/for-workers')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Worker Portal
        </Button>

        <div className="bg-card rounded-2xl shadow-elevated overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-center text-foreground">
              {mode === 'login' ? 'Worker Login' : 'Join as Worker'}
            </h2>
            <p className="text-muted-foreground text-center mt-2">
              {mode === 'login'
                ? 'Sign in to access your worker dashboard'
                : 'Create your worker account to get started'}
            </p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Please wait...
                  </>
                ) : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            {/* Switch Mode */}
            <p className="text-center text-muted-foreground mt-6">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            {/* Owner Portal Link */}
            <p className="text-center text-muted-foreground mt-4 text-sm">
              Looking to hire help?{' '}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-secondary hover:underline font-medium"
              >
                Go to Owner Portal
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}