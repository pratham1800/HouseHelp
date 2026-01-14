import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Briefcase, User, LogOut, LayoutDashboard, Gift, HelpCircle, UserCircle, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'मराठी' },
];

export const WorkerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/for-workers');
  };

  // Worker-specific nav links - NO Services or Subscription plans
  const navLinks = [
    { label: 'Benefits', href: '/for-workers/benefits', icon: Gift },
    { label: 'My Dashboard', href: '/for-workers/dashboard', icon: LayoutDashboard },
    { label: 'How It Works', href: '/for-workers/how-it-works', icon: HelpCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    navigate(href);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border"
    >
      <div className="container-main flex items-center justify-between h-16 md:h-20 px-4 md:px-8">
        {/* Logo */}
        <Link to="/for-workers" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-foreground">GharSeva</span>
            <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full ml-2">Workers</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className={`flex items-center gap-2 font-medium transition-colors duration-200 ${
                isActive(link.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              {link.label}
            </button>
          ))}
          
          {/* Switch to Owner Portal */}
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-l border-border pl-6"
          >
            For Owners →
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
            >
              {languages.find((l) => l.code === currentLang)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showLangDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 bg-card rounded-lg shadow-elevated border border-border overflow-hidden min-w-[100px]"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang.code);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm ${
                        currentLang === lang.code ? 'bg-muted font-semibold' : ''
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth Actions */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-secondary-foreground font-medium text-sm">
                      {(user.user_metadata?.full_name || user.email || 'W').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="hidden md:inline text-sm font-medium text-foreground">
                  {user.user_metadata?.full_name?.split(' ')[0] || 'Worker'}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-card rounded-xl shadow-elevated border border-border overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.user_metadata?.full_name || 'Worker'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => {
                            navigate('/for-workers/profile');
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <UserCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">My Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate('/for-workers/dashboard');
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">My Dashboard</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate('/for-workers/earnings');
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <IndianRupee className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">Earnings</span>
                        </button>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setShowUserDropdown(false);
                          }}
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
          ) : (
            <Button onClick={() => navigate('/for-workers/auth')}>
              Worker Login
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`flex items-center gap-3 w-full text-left py-2 font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
                  {link.label}
                </button>
              ))}

              {user && (
                <>
                  <button
                    onClick={() => {
                      navigate('/for-workers/profile');
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left py-2 font-medium text-foreground hover:text-primary"
                  >
                    <UserCircle className="w-5 h-5" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/for-workers/earnings');
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left py-2 font-medium text-foreground hover:text-primary"
                  >
                    <IndianRupee className="w-5 h-5" />
                    Earnings
                  </button>
                </>
              )}
              
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block py-2 text-muted-foreground hover:text-foreground border-t border-border pt-4"
              >
                Switch to Owner Portal →
              </Link>
              
              {/* Language Switcher Mobile */}
              <div className="flex gap-2 py-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      currentLang === lang.code
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Auth Actions Mobile */}
              <div className="pt-4 border-t border-border">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      navigate('/for-workers/auth');
                      setIsOpen(false);
                    }}
                  >
                    Worker Login
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
