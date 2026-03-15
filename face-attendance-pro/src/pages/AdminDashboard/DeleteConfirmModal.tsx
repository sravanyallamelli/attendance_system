import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { User } from '../../types';

interface DeleteConfirmModalProps {
  staff: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ staff, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {staff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }} 
            className="bg-white rounded-[40px] p-8 w-full max-w-sm relative z-10 shadow-2xl text-center"
          >
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Delete Staff?</h2>
            <p className="text-zinc-500 mb-8 font-medium">Are you sure you want to delete <span className="text-zinc-900 font-bold">{staff.name}</span>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-3 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 transition-all">Cancel</button>
              <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
