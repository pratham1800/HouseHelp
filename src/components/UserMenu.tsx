import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown, LayoutDashboard, UserCircle, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-medium text-sm">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="hidden md:inline text-sm font-medium text-foreground">
          {displayName}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 w-56 bg-card rounded-xl shadow-elevated border border-border overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>

              <div className="p-2">
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <UserCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">My Profile</span>
                </button>
                <button
                  onClick={() => handleNavigate('/dashboard')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">My Bookings</span>
                </button>
                <button
                  onClick={() => handleNavigate('/employees')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">My Employees</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
