import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  toast: { message: string; type: 'success' | 'error' } | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-bold text-sm">{toast.message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
