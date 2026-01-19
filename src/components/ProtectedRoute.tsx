import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, AppRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  redirectTo 
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const location = useLocation();

  // Show loading state while checking auth and role
  if (authLoading || (user && roleLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in, redirect to appropriate auth page
  if (!user) {
    const isWorkerRoute = location.pathname.startsWith('/for-workers');
    const authPath = isWorkerRoute ? '/for-workers/auth' : '/';
    return <Navigate to={authPath} state={{ from: location }} replace />;
  }

  // Determine effective role: if no role in DB, default based on route context
  // Users who signed up via main portal default to 'owner'
  // Users who signed up via worker portal default to 'worker'
  const effectiveRole: AppRole = role || 
    (location.pathname.startsWith('/for-workers') ? 'worker' : 'owner');

  // If a specific role is required, check it
  if (requiredRole && effectiveRole !== requiredRole) {
    // Redirect based on user's effective role
    const destination = redirectTo || (effectiveRole === 'worker' ? '/for-workers/dashboard' : '/dashboard');
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};
