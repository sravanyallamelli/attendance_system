import React from 'react';
import { motion } from 'motion/react';
import { LogIn, LogOut, MapPin, Camera, Filter, Key, LogOut as LogoutIcon } from 'lucide-react';
import { AttendanceRecord, User } from '../../types';

interface AttendanceTabProps {
  reportData: AttendanceRecord[];
  staffList: User[];
  selectedStaffId: string;
  setSelectedStaffId: (val: string) => void;
  reportDateFilter: string;
  setReportDateFilter: (val: string) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ 
  reportData, 
  staffList, 
  selectedStaffId, 
  setSelectedStaffId, 
  reportDateFilter, 
  setReportDateFilter 
}) => {
  // Group logs by date
  const groupedLogs = reportData?.reduce((acc, record) => {
    const date = new Date(record.timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-8 shadow-sm border border-zinc-200"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-zinc-400" />
          <h2 className="font-bold text-xl">Attendance Logs</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
            <Filter className="w-3 h-3 text-zinc-400" />
            <select 
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none focus:ring-0 cursor-pointer"
            >
              <option value="all">All Staff</option>
              {staffList && staffList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <select 
            value={reportDateFilter}
            onChange={(e) => setReportDateFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="month">This Month</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {groupedLogs && Object.keys(groupedLogs).length > 0 ? (
          Object.entries(groupedLogs).map(([date, logs]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">{date}</h3>
                <div className="h-px bg-zinc-100 w-full" />
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {(logs as AttendanceRecord[]).map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        record.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 
                        record.type === 'OUT' ? 'bg-rose-100 text-rose-600' :
                        record.type === 'LOGIN' ? 'bg-blue-100 text-blue-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {record.type === 'IN' && <LogIn className="w-5 h-5" />}
                        {record.type === 'OUT' && <LogOut className="w-5 h-5" />}
                        {record.type === 'LOGIN' && <Key className="w-5 h-5" />}
                        {record.type === 'LOGOUT' && <LogoutIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{record.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                          <span className="bg-white px-2 py-0.5 rounded-md border border-zinc-100">
                            {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-zinc-300">•</span>
                          <span className="uppercase tracking-wider">
                            {record.type === 'IN' ? 'Punch In' : 
                             record.type === 'OUT' ? 'Punch Out' :
                             record.type === 'LOGIN' ? 'App Login' : 'App Logout'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {record.lat && record.lng && (
                        <a 
                          href={`https://www.google.com/maps?q=${record.lat},${record.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-zinc-500 rounded-lg text-[10px] font-bold border border-zinc-100 hover:bg-zinc-50 transition-all"
                        >
                          <MapPin className="w-3 h-3" /> Map
                        </a>
                      )}
                      {record.photo ? (
                        <div className="relative group">
                          <img 
                            src={record.photo} 
                            alt="Punch" 
                            className="w-10 h-10 rounded-lg object-cover border border-zinc-200 shadow-sm cursor-zoom-in group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-200 border border-zinc-300 flex items-center justify-center">
                          <Camera className="w-4 h-4 text-zinc-400" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-zinc-50 rounded-[32px] border border-dashed border-zinc-200">
            <Camera className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm font-medium">No attendance logs found for this selection</p>
          </div>
        )}
      </div>
    </motion.section>
  );
};
