'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, Mail, ArrowRight, Loader2, Dices } from 'lucide-react';
import { authApi } from '@/lib/api-client';
import { getDeviceFingerprint } from '@/lib/fingerprint';

interface AuthScreenProps {
  onLogin: () => void;
}

// Username generation words
const adjectives = ['Silent', 'Hidden', 'Quiet', 'Secret', 'Unseen', 'Shadow', 'Mystic', 'Phantom', 'Ghost', 'Whisper'];
const nouns = ['Soul', 'Voice', 'Heart', 'Mind', 'Spirit', 'Dream', 'Thought', 'Echo', 'Wanderer', 'Seeker'];

function generateUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // Generate username on component mount for signup
  useEffect(() => {
    if (!isLogin && !formData.username) {
      setFormData(prev => ({ ...prev, username: generateUsername() }));
    }
  }, [isLogin]);

  const handleGenerateUsername = () => {
    setFormData(prev => ({ ...prev, username: generateUsername() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.username || !formData.password) {
          setError('Please enter username and password');
          setLoading(false);
          return;
        }

        const response = await authApi.login({
          username: formData.username,
          password: formData.password,
        });

        if (response.success) {
          // Store user data in localStorage
          localStorage.setItem('unseen_user', JSON.stringify(response.user));
          onLogin();
        } else {
          setError(response.error || 'Login failed');
        }
      } else {
        // Signup
        if (!formData.username || !formData.password) {
          setError('Please enter username and password');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        // Get device fingerprint
        const deviceFingerprint = await getDeviceFingerprint();

        const response = await authApi.signup({
          username: formData.username,
          password: formData.password,
          email: formData.email || undefined,
          deviceFingerprint,
          displayName: formData.username,
        });

        if (response.success) {
          // Store user data in localStorage
          localStorage.setItem('unseen_user', JSON.stringify(response.user));
          onLogin();
        } else {
          setError(response.error || 'Signup failed');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0f1c 0%, #0c1628 50%, #0a1020 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background effects - hidden on small mobile for performance */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(74, 124, 201, 0.08) 0%, transparent 60%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 92, 168, 0.06) 0%, transparent 60%)',
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Logo and tagline */}
        <motion.div 
          className="text-center mb-6 sm:mb-8 md:mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.2em] sm:tracking-[0.25em] mb-3 sm:mb-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
            initial={{ letterSpacing: '0.5em', opacity: 0 }}
            animate={{ letterSpacing: window.innerWidth < 640 ? '0.2em' : '0.25em', opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className="gradient-text">UNSEEN</span>
          </motion.h1>
          <motion.p 
            className="text-[#5a7ab0] text-xs sm:text-sm tracking-wide px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Say it. Without being seen.
          </motion.p>
        </motion.div>

        {/* Auth form card */}
        <motion.div 
          className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 intimate-shadow"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          layout
        >
          {/* Tab switcher */}
          <div className="flex gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-[#0d1526]/60 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
            <motion.button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 relative ${
                isLogin 
                  ? 'text-[#e0eaff]' 
                  : 'text-[#5a7ab0] hover:text-[#7a9fd4]'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {isLogin && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#2a4d8f]/40 to-[#3b5ca8]/40 rounded-lg sm:rounded-xl"
                  layoutId="authTab"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Sign In</span>
            </motion.button>
            <motion.button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 relative ${
                !isLogin 
                  ? 'text-[#e0eaff]' 
                  : 'text-[#5a7ab0] hover:text-[#7a9fd4]'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {!isLogin && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#2a4d8f]/40 to-[#3b5ca8]/40 rounded-lg sm:rounded-xl"
                  layoutId="authTab"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Create Account</span>
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-red-400 text-xs sm:text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Email field (signup only) */}
            <motion.div
              initial={false}
              animate={{ 
                height: isLogin ? 0 : 'auto', 
                opacity: isLogin ? 0 : 1,
                marginBottom: isLogin ? 0 : 12,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#5a7ab0]" />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#142240]/50 border border-[#1e3a6e]/20 rounded-lg sm:rounded-xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-[#e0eaff] placeholder:text-[#5a7ab0] focus:outline-none focus:border-[#4a7cc9]/50 focus:bg-[#1a2d50]/50 transition-all"
                />
              </div>
            </motion.div>

            {/* Username field */}
            <div className="relative group">
              <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#5a7ab0] group-focus-within:text-[#7aa2e3] transition-colors" />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full bg-[#142240]/50 border border-[#1e3a6e]/20 rounded-lg sm:rounded-xl py-3 sm:py-4 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base text-[#e0eaff] placeholder:text-[#5a7ab0] focus:outline-none focus:border-[#4a7cc9]/50 focus:bg-[#1a2d50]/50 transition-all"
              />
              {!isLogin && (
                <button
                  type="button"
                  onClick={handleGenerateUsername}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#5a7ab0] hover:text-[#7a9fd4] transition-colors p-1 touch-manipulation"
                  title="Generate new username"
                >
                  <Dices className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Password field */}
            <div className="relative group">
              <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#5a7ab0] group-focus-within:text-[#7aa2e3] transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full bg-[#142240]/50 border border-[#1e3a6e]/20 rounded-lg sm:rounded-xl py-3 sm:py-4 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base text-[#e0eaff] placeholder:text-[#5a7ab0] focus:outline-none focus:border-[#4a7cc9]/50 focus:bg-[#1a2d50]/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#5a7ab0] hover:text-[#7a9fd4] transition-colors p-1 touch-manipulation"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium text-white text-sm sm:text-base relative overflow-hidden group mt-4 sm:mt-6 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              style={{
                background: 'linear-gradient(135deg, #3b5ca8 0%, #2a4d8f 50%, #1e3b6f 100%)',
              }}
              whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 30px rgba(74, 124, 201, 0.3)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm sm:text-base">{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm sm:text-base">{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              {!loading && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-[#4a7cc9] to-[#3b5ca8]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Terms and privacy */}
        <motion.p 
          className="text-center text-[#3b5998] text-[10px] sm:text-xs mt-6 sm:mt-8 leading-relaxed px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          By continuing, you agree to our{' '}
          <span className="text-[#5a7ab0] hover:text-[#7a9fd4] cursor-pointer transition-colors">Terms of Service</span>
          {' '}and{' '}
          <span className="text-[#5a7ab0] hover:text-[#7a9fd4] cursor-pointer transition-colors">Privacy Policy</span>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
