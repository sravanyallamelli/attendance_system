import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, FileText, Download, Upload } from 'lucide-react';
import { User, AttendanceRecord, PayrollEntry } from '../../types';

interface ReportsTabProps {
  selectedStaffId: string;
  setSelectedStaffId: (val: string) => void;
  reportDateFilter: string;
  setReportDateFilter: (val: string) => void;
  staffList: User[];
  reportData: AttendanceRecord[];
  payrollData: PayrollEntry[];
  onUploadPayslip: (userId: number, month: string, year: number, file: File) => void;
  downloadDayWiseReport: () => void;
  downloadPayrollReport: () => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  selectedStaffId,
  setSelectedStaffId,
  reportDateFilter,
  setReportDateFilter,
  staffList,
  reportData,
  payrollData,
  onUploadPayslip,
  downloadDayWiseReport,
  downloadPayrollReport
}) => {
  const handleFileChange = (userId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const now = new Date();
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      onUploadPayslip(userId, monthNames[now.getMonth()], now.getFullYear(), file);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-8 shadow-sm border border-zinc-200"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-zinc-400" />
          <h2 className="font-bold text-xl">Consolidated Report</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">All Staff</option>
            {staffList && staffList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          
          <select 
            value={reportDateFilter}
            onChange={(e) => setReportDateFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="today">Today</option>
            <option value="month">This Month</option>
            <option value="30days">Last 30 Days</option>
          </select>

          <div className="flex gap-2">
            <button 
              onClick={downloadDayWiseReport}
              className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all"
              title="Download Day-wise Attendance"
            >
              <FileText className="w-4 h-4" /> Attendance
            </button>
            <button 
              onClick={downloadPayrollReport}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all"
              title="Download Payroll Report"
            >
              <Download className="w-4 h-4" /> Payroll
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100">
              <th className="pb-4 px-2">Staff</th>
              <th className="pb-4 px-2">Monthly Salary</th>
              <th className="pb-4 px-2">Present Days</th>
              <th className="pb-4 px-2">Calculated Pay</th>
              <th className="pb-4 px-2">Latest Punch</th>
              <th className="pb-4 px-2">Location</th>
              <th className="pb-4 px-2">Photo</th>
              <th className="pb-4 px-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {payrollData && payrollData.map((p, i) => {
              const latestPunch = reportData?.find(r => r.name === p.name);
              const staff = staffList?.find(s => s.name === p.name);
              return (
                <tr key={i} className="text-sm">
                  <td className="py-4 px-2">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Staff ID: {i+1}</p>
                  </td>
                  <td className="py-4 px-2 text-zinc-500 font-medium">₹{p.salary}</td>
                  <td className="py-4 px-2 font-bold text-zinc-900">{p.presentDays} Days</td>
                  <td className="py-4 px-2">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-bold text-xs">
                      ₹{p.totalPay}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    {latestPunch ? (
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full w-fit mb-1 ${latestPunch.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {latestPunch.type}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {new Date(latestPunch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-300 text-[10px]">No activity</span>
                    )}
                  </td>
                  <td className="py-4 px-2">
                    {latestPunch?.lat && latestPunch?.lng ? (
                      <a 
                        href={`https://www.google.com/maps?q=${latestPunch.lat},${latestPunch.lng}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-[10px] font-bold"
                      >
                        View Map
                      </a>
                    ) : (
                      <span className="text-zinc-300 text-[10px]">N/A</span>
                    )}
                  </td>
                  <td className="py-4 px-2">
                    {latestPunch?.photo ? (
                      <img src={latestPunch.photo} className="w-8 h-8 rounded-lg object-cover border border-zinc-100" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200" />
                    )}
                  </td>
                  <td className="py-4 px-2">
                    {staff && (
                      <div className="relative">
                        <input 
                          type="file" 
                          id={`payslip-${staff.id}`}
                          className="hidden" 
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileChange(staff.id, e)}
                        />
                        <label 
                          htmlFor={`payslip-${staff.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-zinc-200 transition-all"
                        >
                          <Upload className="w-3 h-3" /> Payslip
                        </label>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!payrollData || payrollData.length === 0) && (
          <p className="text-center py-8 text-zinc-400 font-medium">No staff data available</p>
        )}
      </div>
    </motion.section>
  );
};
