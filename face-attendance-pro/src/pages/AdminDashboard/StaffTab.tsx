import React from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Power, Trash2, Edit2 } from 'lucide-react';
import { User } from '../../types';

interface StaffTabProps {
  staffList: User[];
  setShowAddStaff: (val: boolean) => void;
  toggleStaffStatus: (staff: User) => void;
  setStaffToDelete: (staff: User) => void;
  openEditModal: (staff: User) => void;
}

export const StaffTab: React.FC<StaffTabProps> = ({ 
  staffList, 
  setShowAddStaff, 
  toggleStaffStatus, 
  setStaffToDelete,
  openEditModal
}) => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-8 shadow-sm border border-zinc-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-zinc-400" />
          <h2 className="font-bold text-xl">Staff Members</h2>
        </div>
        <button 
          onClick={() => setShowAddStaff(true)}
          className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="space-y-4">
        {staffList && staffList.map(staff => (
          <div key={staff.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center font-bold text-zinc-500">
                {staff.name[0]}
              </div>
              <div>
                <p className="font-bold">{staff.name}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs text-zinc-500 font-medium">{staff.mobile}</p>
                  {staff.designation && (
                    <>
                      <span className="text-[10px] text-zinc-400 font-bold">•</span>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{staff.designation}</p>
                    </>
                  )}
                  {staff.department && (
                    <>
                      <span className="text-[10px] text-zinc-400 font-bold">•</span>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{staff.department}</p>
                    </>
                  )}
                  <span className="text-[10px] text-zinc-400 font-bold">•</span>
                  <p className="text-[10px] text-zinc-900 font-bold">₹{staff.salary || 0}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${staff.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-500'}`}>
                {staff.status}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => openEditModal(staff)}
                  className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                  title="Edit Staff"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleStaffStatus(staff)}
                  className={`p-2 rounded-lg transition-colors ${staff.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                  title={staff.status === 'active' ? 'Deactivate' : 'Activate'}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setStaffToDelete(staff)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Staff"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
};
