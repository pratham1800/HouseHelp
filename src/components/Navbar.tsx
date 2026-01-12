import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'मराठी' },
];

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Subscription', href: '#subscription' },
  { label: 'About Us', href: '#about' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  return (
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
            <a
              key={link.label}
              href={link.href}
              className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
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

          <Button variant="ghost" size="sm">
            <User className="w-4 h-4 mr-2" />
            Login
          </Button>
          <Button variant="default" size="default">
            Sign Up
          </Button>
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
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-foreground font-medium hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
              
              {/* Language Switcher Mobile */}
              <div className="flex gap-2 py-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      currentLang === lang.code
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1">
                  Login
                </Button>
                <Button variant="default" className="flex-1">
                  Sign Up
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
