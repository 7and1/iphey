'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, Home, Fingerprint, BookOpen } from 'lucide-react';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'API Reference', href: '/api-reference', icon: Home },
    { label: 'Features', href: '#features', icon: Fingerprint },
    { label: 'Documentation', href: '/docs', icon: BookOpen },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 backdrop-blur-md bg-surface/80 border-b border-white/5"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <a href="/" className="flex items-center gap-3">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full" />
                <Shield className="relative h-8 w-8 text-accent" strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">IPhey</span>
                <span className="text-[10px] text-slate-400 -mt-1 tracking-wider uppercase">
                  Identity Intelligence
                </span>
              </div>
            </motion.div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  <motion.div
                    className="absolute inset-0 bg-accent/10 rounded-lg"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.a>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={toggleMobileMenu}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-panel/60 text-slate-300 hover:text-white hover:bg-panel transition-colors"
              whileTap={{ scale: 0.9 }}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-white/5"
          >
            <nav className="px-4 py-4 space-y-1 bg-panel/40 backdrop-blur-sm">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-accent/10 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </motion.a>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
