import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LogOut as LogoutIcon, 
  Users, 
  FileText, 
  BarChart3, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StaffTab } from './StaffTab';
import { LeavesTab } from './LeavesTab';
import { ReportsTab } from './ReportsTab';
import { HolidaysTab } from './HolidaysTab';
import { AttendanceTab } from './AttendanceTab';
import { User, LeaveRequest, AttendanceRecord, PayrollEntry, Holiday, AttendanceSummary } from '../../types';

interface AdminDashboardProps {
  currentUser: User | null;
  handleLogout: () => void;
  adminTab: 'staff' | 'leaves' | 'reports' | 'holidays' | 'attendance';
  setAdminTab: (tab: 'staff' | 'leaves' | 'reports' | 'holidays' | 'attendance') => void;
  staffList: User[];
  setShowAddStaff: (val: boolean) => void;
  toggleStaffStatus: (staff: User) => void;
  setStaffToDelete: (staff: User) => void;
  openEditModal: (staff: User) => void;
  adminLeaves: LeaveRequest[];
  handleLeaveAction: (id: number, status: string) => void;
  selectedStaffId: string;
  setSelectedStaffId: (val: string) => void;
  reportDateFilter: string;
  setReportDateFilter: (val: string) => void;
  reportData: AttendanceRecord[];
  payrollData: PayrollEntry[];
  holidays: Holiday[];
  summary: AttendanceSummary | null;
  handleAddHoliday: (h: Partial<Holiday>) => void;
  handleDeleteHoliday: (id: number) => void;
  handleUploadPayslip: (userId: number, month: string, year: number, file: File) => void;
  downloadDayWiseReport: () => void;
  downloadPayrollReport: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  handleLogout,
  adminTab,
  setAdminTab,
  staffList,
  setShowAddStaff,
  toggleStaffStatus,
  setStaffToDelete,
  openEditModal,
  adminLeaves,
  handleLeaveAction,
  selectedStaffId,
  setSelectedStaffId,
  reportDateFilter,
  setReportDateFilter,
  reportData,
  payrollData,
  holidays,
  handleAddHoliday,
  handleDeleteHoliday,
  handleUploadPayslip,
  downloadDayWiseReport,
  downloadPayrollReport
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'staff', label: 'Staff Members', icon: Users },
    { id: 'leaves', label: 'Leave Requests', icon: FileText },
    { id: 'reports', label: 'Consolidated Report', icon: BarChart3 },
    { id: 'attendance', label: 'Attendance Logs', icon: Clock },
    { id: 'holidays', label: 'Holidays', icon: CalendarIcon },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar for Desktop */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="hidden md:flex flex-col bg-white border-r border-zinc-200 sticky top-0 h-screen z-20"
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <div className="bg-zinc-900 p-2 rounded-xl">
                  <ShieldCheck className="text-white w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-sm leading-tight">Admin Console</h1>
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Control Center</p>
                </div>
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mx-auto"
              >
                <ShieldCheck className="text-zinc-900 w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setAdminTab(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group relative ${
                adminTab === item.id 
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' 
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${adminTab === item.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'}`} />
              {!isCollapsed && (
                <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100 space-y-2">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center gap-4 p-3 rounded-2xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-bold text-sm">Collapse Sidebar</span>
              </>
            )}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogoutIcon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
            {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-zinc-200 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-zinc-900 w-6 h-6" />
          <h1 className="font-bold text-lg">Admin</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-zinc-100 rounded-xl"
        >
          <Menu className="w-6 h-6 text-zinc-900" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-4/5 bg-white z-50 md:hidden p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-900 p-2 rounded-xl">
                    <ShieldCheck className="text-white w-5 h-5" />
                  </div>
                  <h1 className="font-bold text-xl">Menu</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAdminTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      adminTab === item.id 
                        ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' 
                        : 'text-zinc-500 hover:bg-zinc-100'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-bold text-lg">{item.label}</span>
                  </button>
                ))}
              </nav>

              <button 
                onClick={handleLogout}
                className="mt-auto flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
              >
                <LogoutIcon className="w-6 h-6" />
                <span className="font-bold text-lg">Logout</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-24 md:pt-12 pb-12">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">
                {navItems.find(i => i.id === adminTab)?.label}
              </h2>
              <p className="text-zinc-500 font-medium">Manage your organization's {adminTab} efficiently</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={adminTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {adminTab === 'staff' && (
                <StaffTab 
                  staffList={staffList}
                  setShowAddStaff={setShowAddStaff}
                  toggleStaffStatus={toggleStaffStatus}
                  setStaffToDelete={setStaffToDelete}
                  openEditModal={openEditModal}
                />
              )}

              {adminTab === 'leaves' && (
                <LeavesTab 
                  adminLeaves={adminLeaves}
                  handleLeaveAction={handleLeaveAction}
                />
              )}

              {adminTab === 'reports' && (
                <ReportsTab 
                  selectedStaffId={selectedStaffId}
                  setSelectedStaffId={setSelectedStaffId}
                  reportDateFilter={reportDateFilter}
                  setReportDateFilter={setReportDateFilter}
                  staffList={staffList}
                  reportData={reportData}
                  payrollData={payrollData}
                  onUploadPayslip={handleUploadPayslip}
                  downloadDayWiseReport={downloadDayWiseReport}
                  downloadPayrollReport={downloadPayrollReport}
                />
              )}

              {adminTab === 'attendance' && (
                <AttendanceTab 
                  reportData={reportData}
                  staffList={staffList}
                  selectedStaffId={selectedStaffId}
                  setSelectedStaffId={setSelectedStaffId}
                  reportDateFilter={reportDateFilter}
                  setReportDateFilter={setReportDateFilter}
                />
              )}

              {adminTab === 'holidays' && (
                <HolidaysTab 
                  holidays={holidays}
                  onAdd={handleAddHoliday}
                  onDelete={handleDeleteHoliday}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
