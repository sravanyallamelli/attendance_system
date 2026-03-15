import { User, LeaveRequest, AttendanceRecord, Holiday, AttendanceSummary, Payslip } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  login: async (mobile: string, password?: string): Promise<User> => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  logout: async (userId: number): Promise<void> => {
    await fetch(`${BASE_URL}/api/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  },

  forgotPassword: async (mobile: string, email: string): Promise<{ userId: number }> => {
    const res = await fetch(`${BASE_URL}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, email })
    });
    if (!res.ok) throw new Error('Verification failed');
    return res.json();
  },

  resetPassword: async (userId: number, newPassword: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newPassword })
    });
    if (!res.ok) throw new Error('Reset failed');
  },

  getAttendance: async (userId: number, type: 'today' | 'yesterday'): Promise<AttendanceRecord[]> => {
    const res = await fetch(`${BASE_URL}/api/attendance/${type}/${userId}`);
    if (!res.ok) throw new Error(`Failed to fetch ${type} attendance`);
    return res.json();
  },

  getLeaves: async (userId: number): Promise<LeaveRequest[]> => {
    const res = await fetch(`${BASE_URL}/api/leaves/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch leaves');
    return res.json();
  },

  submitLeave: async (leaveData: Partial<LeaveRequest>): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData)
    });
    if (!res.ok) throw new Error('Failed to submit leave');
  },

  punch: async (punchData: Partial<AttendanceRecord>): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(punchData)
    });
    if (!res.ok) throw new Error('Punch failed');
  },

  // Admin APIs
  getStaffList: async (adminId: number): Promise<User[]> => {
    const res = await fetch(`${BASE_URL}/api/admin/staff`, {
      headers: { 'x-requester-id': adminId.toString() }
    });
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  },

  getAdminReports: async (adminId: number, staffId: string, filter: string): Promise<AttendanceRecord[]> => {
    const res = await fetch(`${BASE_URL}/api/admin/reports?staffId=${staffId}&filter=${filter}`, {
      headers: { 'x-requester-id': adminId.toString() }
    });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  getAdminLeaves: async (adminId: number): Promise<LeaveRequest[]> => {
    const res = await fetch(`${BASE_URL}/api/admin/leaves`, {
      headers: { 'x-requester-id': adminId.toString() }
    });
    if (!res.ok) throw new Error('Failed to fetch admin leaves');
    return res.json();
  },

  updateLeaveStatus: async (adminId: number, leaveId: number, status: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/admin/leaves/${leaveId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'x-requester-id': adminId.toString()
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update leave status');
  },

  addStaff: async (adminId: number, staffData: any): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/admin/staff`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-requester-id': adminId.toString()
      },
      body: JSON.stringify(staffData)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add staff');
    }
  },

  updateStaff: async (adminId: number, staffId: number, staffData: any): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/admin/staff/${staffId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-requester-id': adminId.toString()
      },
      body: JSON.stringify(staffData)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update staff');
    }
  },

  toggleStaffStatus: async (adminId: number, staffId: number, status: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/admin/staff/${staffId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'x-requester-id': adminId.toString()
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update staff status');
  },

  deleteStaff: async (adminId: number, staffId: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/admin/staff/${staffId}`, {
      method: 'DELETE',
      headers: { 'x-requester-id': adminId.toString() }
    });
    if (!res.ok) throw new Error('Failed to delete staff');
  },

  getHolidays: async (): Promise<Holiday[]> => {
    const res = await fetch(`${BASE_URL}/api/holidays`);
    if (!res.ok) throw new Error('Failed to fetch holidays');
    return res.json();
  },

  addHoliday: async (adminId: number, holiday: Partial<Holiday>): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/admin/holidays`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-requester-id': adminId.toString()
      },
      body: JSON.stringify(holiday)
    });
    if (!res.ok) throw new Error('Failed to add holiday');
  },

  deleteHoliday: async (adminId: number, id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/admin/holidays/${id}`, {
      method: 'DELETE',
      headers: { 'x-requester-id': adminId.toString() }
    });
    if (!res.ok) throw new Error('Failed to delete holiday');
  },

  getAdminSummary: async (adminId: number): Promise<AttendanceSummary> => {
    const res = await fetch(`${BASE_URL}/api/admin/summary`, {
      headers: { 'x-requester-id': adminId.toString() }
    });
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },

  getPayslips: async (userId: number): Promise<Payslip[]> => {
    const res = await fetch(`${BASE_URL}/api/payslips/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch payslips');
    return res.json();
  },

  uploadPayslip: async (adminId: number, payslip: Partial<Payslip>): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/admin/payslips`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-requester-id': adminId.toString()
      },
      body: JSON.stringify(payslip)
    });
    if (!res.ok) throw new Error('Failed to upload payslip');
  }
};
