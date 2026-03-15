import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Loader2, Lock, Mail, X, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

interface LoginProps {
  mobileInput: string;
  setMobileInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  isLoading: boolean;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const Login: React.FC<LoginProps> = ({ 
  mobileInput, 
  setMobileInput, 
  passwordInput,
  setPasswordInput,
  handleLogin, 
  isLoading,
  showToast
}) => {
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<'verify' | 'reset'>('verify');
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    try {
      const { userId } = await api.forgotPassword(forgotMobile, forgotEmail);
      setResetUserId(userId);
      setForgotStep('reset');
      showToast('Details verified. Please set your new password.');
    } catch (err) {
      showToast('Invalid mobile or email combination', 'error');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId) return;
    setIsForgotLoading(true);
    try {
      await api.resetPassword(resetUserId, newPassword);
      showToast('Password reset successfully. Please login.');
      setShowForgot(false);
      setForgotStep('verify');
      setForgotMobile('');
      setForgotEmail('');
      setNewPassword('');
    } catch (err) {
      showToast('Failed to reset password', 'error');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[40px] shadow-2xl max-w-md w-full border border-zinc-100"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-zinc-900 p-4 rounded-3xl mb-4 shadow-xl">
            <Phone className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Staff Portal</h1>
          <p className="text-zinc-500 font-medium">Enter your credentials to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                type="tel" 
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full pl-14 pr-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-bold text-lg"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Password</label>
              <button 
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-14 pr-14 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-bold text-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-zinc-400" />
                ) : (
                  <Eye className="w-5 h-5 text-zinc-400" />
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Continue'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Authorized Access Only</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-[40px] shadow-2xl max-w-md w-full relative"
            >
              <button 
                onClick={() => {
                  setShowForgot(false);
                  setForgotStep('verify');
                }}
                className="absolute right-6 top-6 p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </button>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">
                  {forgotStep === 'verify' ? 'Forgot Password' : 'Reset Password'}
                </h2>
                <p className="text-zinc-500 text-sm">
                  {forgotStep === 'verify' 
                    ? 'Enter your registered mobile and email to verify your identity.' 
                    : 'Create a new secure password for your account.'}
                </p>
              </div>

              {forgotStep === 'verify' ? (
                <form onSubmit={handleForgotVerify} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input 
                        type="tel" 
                        value={forgotMobile}
                        onChange={(e) => setForgotMobile(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-14 pr-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-bold"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input 
                        type="email" 
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-14 pr-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-bold"
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isForgotLoading}
                    className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isForgotLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify Identity'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-14 pr-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-bold"
                        required
                        minLength={4}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isForgotLoading}
                    className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isForgotLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Update Password'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
