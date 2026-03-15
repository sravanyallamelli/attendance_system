import React, { useState, useEffect, useCallback } from 'react';
import { User, AttendanceRecord, LeaveRequest, PayrollEntry, Holiday, AttendanceSummary } from '../types';
import { api } from '../services/api';

export const useAdmin = (currentUser: User | null, showToast: (m: string, t?: 'success' | 'error') => void) => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [reportData, setReportData] = useState<AttendanceRecord[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [reportDateFilter, setReportDateFilter] = useState<string>('30days');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ 
    name: '', 
    mobile: '', 
    email: '', 
    designation: '', 
    department: '', 
    join_date: '', 
    address: '', 
    salary: '',
    password: ''
  });
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null);
  const [staffToEdit, setStaffToEdit] = useState<User | null>(null);
  const [adminLeaves, setAdminLeaves] = useState<LeaveRequest[]>([]);
  const [adminTab, setAdminTab] = useState<'staff' | 'leaves' | 'reports' | 'holidays' | 'attendance'>('staff');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);

  const fetchAdminData = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const [staff, reports, holidayList, summaryData] = await Promise.all([
        api.getStaffList(currentUser.id),
        api.getAdminReports(currentUser.id, selectedStaffId, reportDateFilter),
        api.getHolidays(),
        api.getAdminSummary(currentUser.id)
      ]);
      setStaffList(staff);
      setReportData(reports);
      setHolidays(holidayList);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
    }
  }, [currentUser, selectedStaffId, reportDateFilter]);

  const fetchAdminLeaves = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const data = await api.getAdminLeaves(currentUser.id);
      setAdminLeaves(data);
    } catch (err) {
      console.error(err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAdminData();
      fetchAdminLeaves();
    }
  }, [currentUser, fetchAdminData, fetchAdminLeaves]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      if (staffToEdit) {
        await api.updateStaff(currentUser.id, staffToEdit.id, newStaff);
        showToast('Staff member updated successfully!');
      } else {
        await api.addStaff(currentUser.id, newStaff);
        showToast('Staff member added successfully!');
      }
      setShowAddStaff(false);
      setStaffToEdit(null);
      setNewStaff({ 
        name: '', 
        mobile: '', 
        email: '', 
        designation: '', 
        department: '', 
        join_date: '', 
        address: '', 
        salary: '',
        password: ''
      });
      fetchAdminData();
    } catch (err: any) {
      showToast(err.message || (staffToEdit ? 'Failed to update staff' : 'Failed to add staff'), 'error');
    }
  };

  const openEditModal = (staff: User) => {
    setStaffToEdit(staff);
    setNewStaff({
      name: staff.name,
      mobile: staff.mobile,
      email: staff.email || '',
      designation: staff.designation || '',
      department: staff.department || '',
      join_date: staff.join_date || '',
      address: staff.address || '',
      salary: staff.salary?.toString() || '',
      password: staff.password || ''
    });
    setShowAddStaff(true);
  };

  const toggleStaffStatus = async (staff: User) => {
    if (!currentUser) return;
    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    try {
      await api.toggleStaffStatus(currentUser.id, staff.id, newStatus);
      showToast(`Staff ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchAdminData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteStaff = async () => {
    if (!currentUser || !staffToDelete) return;
    try {
      await api.deleteStaff(currentUser.id, staffToDelete.id);
      showToast('Staff member deleted');
      setStaffToDelete(null);
      fetchAdminData();
    } catch (err) {
      showToast('Failed to delete staff', 'error');
    }
  };

  const handleLeaveAction = async (id: number, status: string) => {
    if (!currentUser) return;
    try {
      await api.updateLeaveStatus(currentUser.id, id, status);
      showToast(`Leave request ${status}`);
      fetchAdminLeaves();
      fetchAdminData(); // Refresh staff list for leave balance
    } catch (err) {
      showToast('Failed to update leave', 'error');
    }
  };

  const handleAddHoliday = async (h: Partial<Holiday>) => {
    if (!currentUser) return;
    try {
      await api.addHoliday(currentUser.id, h);
      showToast('Holiday added successfully!');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to add holiday', 'error');
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (!currentUser) return;
    try {
      await api.deleteHoliday(currentUser.id, id);
      showToast('Holiday deleted');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to delete holiday', 'error');
    }
  };

  const handleUploadPayslip = async (userId: number, month: string, year: number, file: File) => {
    if (!currentUser) return;
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await api.uploadPayslip(currentUser.id, {
          user_id: userId,
          month,
          year,
          pdf_url: reader.result as string
        });
        showToast('Payslip uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast('Failed to upload payslip', 'error');
    }
  };

  const calculatePayroll = (): PayrollEntry[] => {
    return staffList.map(staff => {
      const staffAttendance = reportData.filter(r => r.name === staff.name && r.type === 'IN');
      const presentDays = new Set(staffAttendance.map(r => new Date(r.timestamp).toDateString())).size;
      
      // Calculate holiday work (overtime)
      const holidayDates = new Set(holidays.map(h => new Date(h.date).toDateString()));
      const holidayDays = new Set(
        staffAttendance
          .filter(r => holidayDates.has(new Date(r.timestamp).toDateString()))
          .map(r => new Date(r.timestamp).toDateString())
      ).size;
      
      const salary = staff.salary || 0;
      const dailyRate = salary / 30;
      // Overtime: 2x pay for holidays
      const totalPay = Math.round((presentDays * dailyRate) + (holidayDays * dailyRate));
      
      return { name: staff.name, salary, presentDays, holidayDays, totalPay };
    });
  };

  const downloadDayWiseReport = () => {
    const headers = ['Date', 'Name', 'Mobile', 'Type', 'Time', 'Location'];
    const rows = reportData.map(r => [
      new Date(r.timestamp).toLocaleDateString(),
      r.name,
      r.mobile,
      r.type,
      new Date(r.timestamp).toLocaleTimeString(),
      r.lat ? `${r.lat},${r.lng}` : 'N/A'
    ]);
    downloadCSV('attendance_report.csv', [headers, ...rows]);
  };

  const downloadPayrollReport = () => {
    const headers = ['Name', 'Monthly Salary', 'Present Days', 'Calculated Pay'];
    const rows = calculatePayroll().map(p => [p.name, p.salary, p.presentDays, p.totalPay]);
    downloadCSV('payroll_report.csv', [headers, ...rows]);
  };

  const downloadCSV = (filename: string, data: any[][]) => {
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return {
    staffList,
    reportData,
    selectedStaffId,
    setSelectedStaffId,
    reportDateFilter,
    setReportDateFilter,
    showAddStaff,
    setShowAddStaff,
    newStaff,
    setNewStaff,
    staffToDelete,
    setStaffToDelete,
    staffToEdit,
    setStaffToEdit,
    adminLeaves,
    adminTab,
    setAdminTab,
    holidays,
    summary,
    handleAddStaff,
    openEditModal,
    toggleStaffStatus,
    handleDeleteStaff,
    handleLeaveAction,
    handleAddHoliday,
    handleDeleteHoliday,
    handleUploadPayslip,
    calculatePayroll,
    downloadDayWiseReport,
    downloadPayrollReport
  };
};
