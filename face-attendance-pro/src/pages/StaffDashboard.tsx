import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, LogIn, LogOut, Calendar, Loader2, FileText, LogOut as LogoutIcon, Home, CreditCard, Key } from 'lucide-react';
import { User, AttendanceRecord, LeaveRequest, Holiday, Payslip } from '../types';

interface StaffDashboardProps {
  currentUser: User | null;
  handleLogout: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isModelLoaded: boolean;
  isCameraReady: boolean;
  isFaceDetected: boolean;
  isProcessing: boolean;
  staffTab: 'attendance' | 'leaves' | 'holidays' | 'payslips';
  setStaffTab: (tab: 'attendance' | 'leaves' | 'holidays' | 'payslips') => void;
  handlePunch: (type: 'IN' | 'OUT') => void;
  hasPunchedInToday: boolean;
  hasPunchedOutToday: boolean;
  todayRecords: AttendanceRecord[];
  yesterdayRecords: AttendanceRecord[];
  leaves: LeaveRequest[];
  holidays: Holiday[];
  payslips: Payslip[];
  setShowLeaveForm: (val: boolean) => void;
  showLeaveForm: boolean;
  newLeave: any;
  setNewLeave: (val: any) => void;
  handleLeaveSubmit: (e: React.FormEvent) => void;
  handleLeaveFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  currentUser,
  handleLogout,
  videoRef,
  isModelLoaded,
  isCameraReady,
  isFaceDetected,
  isProcessing,
  staffTab,
  setStaffTab,
  handlePunch,
  hasPunchedInToday,
  hasPunchedOutToday,
  todayRecords,
  yesterdayRecords,
  leaves,
  holidays,
  payslips,
  setShowLeaveForm,
  showLeaveForm,
  newLeave,
  setNewLeave,
  handleLeaveSubmit,
  handleLeaveFileChange
}) => {
  return (
    <div className="min-h-screen bg-zinc-50 pb-12">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 p-2 rounded-xl">
              <UserIcon className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{currentUser?.name}</h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Staff Portal</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-8 pb-24 space-y-8">
        {staffTab === 'attendance' && (
          <>
            {/* Camera Section */}
            <section className="relative">
              <div className="aspect-square w-full max-w-[320px] mx-auto relative rounded-[40px] overflow-hidden bg-zinc-200 shadow-2xl border-4 border-white ring-1 ring-zinc-200">
                {!isModelLoaded || !isCameraReady ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-100">
                    <Loader2 className="w-10 h-10 text-zinc-400 animate-spin" />
                    <p className="text-sm text-zinc-500 font-medium">Initializing Camera...</p>
                  </div>
                ) : null}
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                {isFaceDetected && (
                  <div className="absolute inset-0 border-[6px] border-emerald-500/50 rounded-[40px] pointer-events-none">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Face Detected</div>
                  </div>
                )}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handlePunch('IN')} 
                disabled={!isFaceDetected || isProcessing || hasPunchedInToday} 
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl transition-all active:scale-95 ${isFaceDetected && !hasPunchedInToday ? 'bg-emerald-500 text-white shadow-lg' : 'bg-zinc-200 text-zinc-400'}`}
              >
                <LogIn className="w-6 h-6" /> <span className="font-bold">Punch In</span>
                {hasPunchedInToday && <span className="text-[8px] font-bold uppercase">Completed</span>}
              </button>
              <button 
                onClick={() => handlePunch('OUT')} 
                disabled={!isFaceDetected || isProcessing || hasPunchedOutToday} 
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl transition-all active:scale-95 ${isFaceDetected && !hasPunchedOutToday ? 'bg-rose-500 text-white shadow-lg' : 'bg-zinc-200 text-zinc-400'}`}
              >
                <LogOut className="w-6 h-6" /> <span className="font-bold">Punch Out</span>
                {hasPunchedOutToday && <span className="text-[8px] font-bold uppercase">Completed</span>}
              </button>
            </section>

            {hasPunchedInToday && hasPunchedOutToday && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                <p className="text-emerald-700 text-sm font-bold">Attendance for today is complete! ✨</p>
              </div>
            )}

            {/* Today's Summary */}
            <section className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-200">
              <h3 className="font-bold text-zinc-500 text-[10px] uppercase tracking-widest mb-4">Today's Activity</h3>
              {todayRecords && todayRecords.length > 0 ? (
                <div className="space-y-3">
                  {todayRecords.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          r.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 
                          r.type === 'OUT' ? 'bg-rose-100 text-rose-600' :
                          r.type === 'LOGIN' ? 'bg-blue-100 text-blue-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {r.type === 'IN' && <LogIn className="w-4 h-4" />}
                          {r.type === 'OUT' && <LogOut className="w-4 h-4" />}
                          {r.type === 'LOGIN' && <Key className="w-4 h-4" />}
                          {r.type === 'LOGOUT' && <LogoutIcon className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">
                            {r.type === 'IN' ? 'Punched IN' : 
                             r.type === 'OUT' ? 'Punched OUT' :
                             r.type === 'LOGIN' ? 'Logged IN' : 'Logged OUT'}
                          </p>
                          <p className="text-[10px] text-zinc-500">{new Date(r.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      {r.photo && <img src={r.photo} className="w-10 h-10 rounded-lg object-cover border border-zinc-200" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-zinc-400 text-sm font-medium">No records for today yet</p>
              )}
            </section>

            {/* Yesterday's Summary */}
            <section className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-200">
              <h3 className="font-bold text-zinc-500 text-[10px] uppercase tracking-widest mb-4">Yesterday's Activity</h3>
              {yesterdayRecords && yesterdayRecords.length > 0 ? (
                <div className="space-y-3">
                  {yesterdayRecords.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          r.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 
                          r.type === 'OUT' ? 'bg-rose-100 text-rose-600' :
                          r.type === 'LOGIN' ? 'bg-blue-100 text-blue-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {r.type === 'IN' && <LogIn className="w-4 h-4" />}
                          {r.type === 'OUT' && <LogOut className="w-4 h-4" />}
                          {r.type === 'LOGIN' && <Key className="w-4 h-4" />}
                          {r.type === 'LOGOUT' && <LogoutIcon className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">
                            {r.type === 'IN' ? 'Punched IN' : 
                             r.type === 'OUT' ? 'Punched OUT' :
                             r.type === 'LOGIN' ? 'Logged IN' : 'Logged OUT'}
                          </p>
                          <p className="text-[10px] text-zinc-500">{new Date(r.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      {r.photo && <img src={r.photo} className="w-10 h-10 rounded-lg object-cover border border-zinc-200" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-zinc-400 text-sm font-medium">No records for yesterday</p>
              )}
            </section>
          </>
        )}

        {staffTab === 'leaves' && (
          <section className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <h3 className="font-bold text-zinc-500 text-[10px] uppercase tracking-widest">Leave Management</h3>
              </div>
              <button 
                onClick={() => setShowLeaveForm(true)}
                className="bg-zinc-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
              >
                Apply Leave
              </button>
            </div>

            {/* Leave Balance Tracker */}
            {(() => {
              const total = currentUser?.total_leaves || 20;
              const used = (leaves || [])
                .filter(l => l.status === 'approved')
                .reduce((acc, l) => {
                  const start = new Date(l.start_date);
                  const end = new Date(l.end_date);
                  const diffTime = Math.abs(end.getTime() - start.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                  return acc + diffDays;
                }, 0);
              const remaining = Math.max(0, total - used);
              const percentage = (used / total) * 100;

              return (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-500">Leave Balance</span>
                    <span className="text-xs font-bold text-zinc-900">{remaining} / {total} Days Left</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-zinc-900"
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-zinc-900" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Used: {used}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-zinc-200" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total: {total}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Status Timeline */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recent Requests</h4>
              {leaves && leaves.length > 0 ? (
                <div className="space-y-3">
                  {leaves.map((l) => (
                    <div key={l.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-900">{l.type}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          l.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          l.status === 'declined' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {l.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 italic line-clamp-1">{l.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">No leave requests yet</p>
              )}
            </div>
          </section>
        )}

        {staffTab === 'holidays' && (
          <section className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <h3 className="font-bold text-zinc-500 text-[10px] uppercase tracking-widest">Upcoming Holidays</h3>
            </div>
            <div className="space-y-3">
              {holidays && holidays.length > 0 ? (
                holidays
                  .filter(h => new Date(h.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{h.name}</p>
                        <p className="text-[10px] text-zinc-500 font-medium">{new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${h.type === 'public' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {h.type}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-center py-4 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">No upcoming holidays</p>
              )}
            </div>
          </section>
        )}

        {staffTab === 'payslips' && (
          <section className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-4 h-4 text-zinc-400" />
              <h3 className="font-bold text-zinc-500 text-[10px] uppercase tracking-widest">My Payslips</h3>
            </div>
            <div className="space-y-3">
              {payslips && payslips.length > 0 ? (
                payslips.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{p.month} {p.year}</p>
                      <p className="text-[10px] text-zinc-500 font-medium">Released on {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <a 
                      href={p.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">No payslips available yet</p>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 flex items-center justify-between z-40 max-w-md mx-auto">
        <button 
          onClick={() => setStaffTab('attendance')}
          className={`flex flex-col items-center gap-1 ${staffTab === 'attendance' ? 'text-zinc-900' : 'text-zinc-400'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={() => setStaffTab('leaves')}
          className={`flex flex-col items-center gap-1 ${staffTab === 'leaves' ? 'text-zinc-900' : 'text-zinc-400'}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Leaves</span>
        </button>
        <button 
          onClick={() => setStaffTab('holidays')}
          className={`flex flex-col items-center gap-1 ${staffTab === 'holidays' ? 'text-zinc-900' : 'text-zinc-400'}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Holidays</span>
        </button>
        <button 
          onClick={() => setStaffTab('payslips')}
          className={`flex flex-col items-center gap-1 ${staffTab === 'payslips' ? 'text-zinc-900' : 'text-zinc-400'}`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Payslips</span>
        </button>
      </nav>

      {/* Leave Application Modal */}
      <AnimatePresence>
        {showLeaveForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" 
              onClick={() => setShowLeaveForm(false)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-[40px] p-8 w-full max-w-md relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-bold mb-6">Apply for Leave</h2>
              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Leave Type</label>
                  <select 
                    value={newLeave.type}
                    onChange={e => setNewLeave({...newLeave, type: e.target.value as LeaveRequest['type']})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                    required
                  >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Paid Leave">Paid Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Start Date</label>
                    <input 
                      type="date" 
                      value={newLeave.start_date}
                      onChange={e => setNewLeave({...newLeave, start_date: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">End Date</label>
                    <input 
                      type="date" 
                      value={newLeave.end_date}
                      onChange={e => setNewLeave({...newLeave, end_date: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Reason for Absence</label>
                  <textarea 
                    value={newLeave.reason}
                    onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium min-h-[100px]"
                    placeholder="Briefly explain your reason..."
                    required
                  />
                </div>
                {newLeave.type === 'Sick Leave' && (
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Medical Certificate</label>
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={handleLeaveFileChange}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium text-xs"
                    />
                    {newLeave.attachment && (
                      <p className="mt-2 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">✓ File attached</p>
                    )}
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowLeaveForm(false)} className="flex-1 px-4 py-3 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all">Submit Request</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
