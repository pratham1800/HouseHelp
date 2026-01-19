import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'owner' | 'worker';

interface UseUserRoleReturn {
  role: AppRole | null;
  loading: boolean;
  hasRole: (checkRole: AppRole) => boolean;
}

export const useUserRole = (): UseUserRoleReturn => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('get_user_role', { _user_id: user.id });

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          setRole(data as AppRole);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const hasRole = (checkRole: AppRole): boolean => {
    return role === checkRole;
  };

  return { role, loading, hasRole };
};
