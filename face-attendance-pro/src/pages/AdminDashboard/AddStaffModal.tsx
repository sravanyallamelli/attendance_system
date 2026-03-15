import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, Mail, Briefcase, Building, Calendar, MapPin } from 'lucide-react';

interface AddStaffModalProps {
  show: boolean;
  onClose: () => void;
  isEditing: boolean;
  newStaff: { 
    name: string; 
    mobile: string; 
    email: string; 
    designation: string; 
    department: string; 
    join_date: string; 
    address: string; 
    salary: string;
    password: string;
  };
  setNewStaff: (val: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ show, onClose, isEditing, newStaff, setNewStaff, onSubmit }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }} 
            className="bg-white rounded-[40px] p-8 w-full max-w-2xl relative z-10 shadow-2xl my-auto"
          >
            <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Staff Member' : 'Add New Staff'}</h2>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input 
                      type="text" 
                      value={newStaff.name}
                      onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                      placeholder="Staff Name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input 
                      type="tel" 
                      value={newStaff.mobile}
                      onChange={e => setNewStaff({...newStaff, mobile: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                      placeholder="10-digit number"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input 
                      type="email" 
                      value={newStaff.email}
                      onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Monthly Salary (₹)</label>
                  <input 
                    type="number" 
                    value={newStaff.salary}
                    onChange={e => setNewStaff({...newStaff, salary: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                    placeholder="e.g. 25000"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Designation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input 
                      type="text" 
                      value={newStaff.designation}
                      onChange={e => setNewStaff({...newStaff, designation: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                      placeholder="e.g. Manager"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Department</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input 
                      type="text" 
                      value={newStaff.department}
                      onChange={e => setNewStaff({...newStaff, department: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                      placeholder="e.g. Sales"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Join Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input 
                      type="date" 
                      value={newStaff.join_date}
                      onChange={e => setNewStaff({...newStaff, join_date: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input 
                      type="text" 
                      value={newStaff.address}
                      onChange={e => setNewStaff({...newStaff, address: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                      placeholder="Full Address"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Password</label>
                  <input 
                    type="text" 
                    value={newStaff.password}
                    onChange={e => setNewStaff({...newStaff, password: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                    placeholder="Set Password"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all">
                  {isEditing ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
