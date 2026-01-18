import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { AuthModal } from '@/components/AuthModal';
import { UserMenu } from '@/components/UserMenu';

const languages = [
  { code: 'en' as const, label: 'EN' },
  { code: 'hi' as const, label: 'हिंदी' },
  { code: 'kn' as const, label: 'ಕನ್ನಡ' },
  { code: 'mr' as const, label: 'मराठी' },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const { user, loading, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { label: t('services'), href: '/#services' },
    { label: t('howItWorks'), href: '/#how-it-works' },
    { label: t('subscription'), href: '/#subscription' },
    { label: t('forWorkers'), href: '/for-workers', isPortalSwitch: true },
    { label: t('aboutUs'), href: '/#about' },
  ];

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsOpen(false);
  };

  const handleNavClick = async (href: string, isPortalSwitch?: boolean) => {
    setIsOpen(false);
    
    // If switching portals and logged in, log out first then navigate
    if (isPortalSwitch && href === '/for-workers' && user) {
      await signOut();
      navigate('/for-workers');
      return;
    }
    
    // Handle anchor links that need navigation to home page first
    if (href.startsWith('/#')) {
      const sectionId = href.substring(2);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (href.startsWith('/')) {
      navigate(href);
    } else if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border"
      >
        <div className="container-main flex items-center justify-between h-16 md:h-20 px-4 md:px-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">G</span>
            </div>
            <span className="font-bold text-xl text-foreground">GharSeva</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href, link.isPortalSwitch)}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
              >
                {languages.find((l) => l.code === language)?.label}
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
                          setLanguage(lang.code);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm ${
                          language === lang.code ? 'bg-muted font-semibold' : ''
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth Buttons or User Menu */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <UserMenu />
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => openAuthModal('login')}>
                  <User className="w-4 h-4 mr-2" />
                  {t('login')}
                </Button>
                <Button variant="default" size="default" onClick={() => openAuthModal('signup')}>
                  {t('signUp')}
                </Button>
              </>
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
                    onClick={() => handleNavClick(link.href, link.isPortalSwitch)}
                    className="block w-full text-left py-2 text-foreground font-medium hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                
                {/* Language Switcher Mobile */}
                <div className="flex gap-2 py-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        language === lang.code
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                {/* Auth Buttons Mobile */}
                {loading ? (
                  <div className="h-10 bg-muted rounded-lg animate-pulse" />
                ) : user ? (
                  <div className="pt-4 border-t border-border">
                    <UserMenu />
                  </div>
                ) : (
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => openAuthModal('login')}>
                      {t('login')}
                    </Button>
                    <Button variant="default" className="flex-1" onClick={() => openAuthModal('signup')}>
                      {t('signUp')}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  );
};
