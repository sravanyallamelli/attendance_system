export interface User {
  id: number;
  mobile: string;
  name: string;
  email?: string;
  designation?: string;
  department?: string;
  join_date?: string;
  address?: string;
  role: 'admin' | 'staff';
  status: 'active' | 'inactive';
  salary?: number;
  total_leaves?: number;
  password?: string;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  type: 'Sick Leave' | 'Casual Leave' | 'Paid Leave';
  start_date: string;
  end_date: string;
  reason: string;
  attachment?: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  name?: string;
  mobile?: string;
}

export interface AttendanceRecord {
  id?: number;
  user_id?: number;
  type: 'IN' | 'OUT' | 'LOGIN' | 'LOGOUT';
  timestamp: string;
  location?: { lat: number; lng: number };
  lat?: number;
  lng?: number;
  photo?: string;
  name?: string;
  mobile?: string;
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
  type: 'public' | 'company';
}

export interface Payslip {
  id: number;
  user_id: number;
  month: string;
  year: number;
  pdf_url: string;
  created_at: string;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  onLeave: number;
  total: number;
  presentList: User[];
  absentList: User[];
  onLeaveList: User[];
}

export interface PayrollEntry {
  name: string;
  salary: number;
  presentDays: number;
  holidayDays: number;
  totalPay: number;
}
