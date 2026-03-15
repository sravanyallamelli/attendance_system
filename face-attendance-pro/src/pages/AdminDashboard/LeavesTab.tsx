import React from 'react';
import { motion } from 'motion/react';
import { Calendar, FileText } from 'lucide-react';
import { LeaveRequest } from '../../types';

interface LeavesTabProps {
  adminLeaves: LeaveRequest[];
  handleLeaveAction: (id: number, status: string) => void;
}

export const LeavesTab: React.FC<LeavesTabProps> = ({ adminLeaves, handleLeaveAction }) => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-8 shadow-sm border border-zinc-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-zinc-400" />
          <h2 className="font-bold text-xl">Leave Requests</h2>
        </div>
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
          {adminLeaves ? adminLeaves.filter(l => l.status === 'pending').length : 0} Pending
        </span>
      </div>

      <div className="space-y-4">
        {adminLeaves && adminLeaves.length > 0 ? (
          adminLeaves.map((l) => (
            <div key={l.id} className="p-6 bg-zinc-50 rounded-[24px] border border-zinc-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center font-bold text-zinc-500">
                    {l.name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{l.name}</p>
                    <p className="text-[10px] text-zinc-500 font-medium">{l.mobile} • {l.type}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                  l.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  l.status === 'declined' ? 'bg-rose-100 text-rose-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {l.status}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs text-zinc-600 font-bold mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{l.reason}</p>
              </div>

              {l.attachment && (
                <div className="mb-4">
                  <a 
                    href={l.attachment} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg"
                  >
                    <FileText className="w-3 h-3" /> View Attachment
                  </a>
                </div>
              )}

              {l.status === 'pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleLeaveAction(l.id, 'approved')}
                    className="flex-1 bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleLeaveAction(l.id, 'declined')}
                    className="flex-1 bg-rose-50 text-rose-600 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center py-8 text-zinc-400 text-sm font-medium">No leave requests found</p>
        )}
      </div>
    </motion.section>
  );
};
