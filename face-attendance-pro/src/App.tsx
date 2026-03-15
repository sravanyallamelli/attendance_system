import React, { useState, useEffect } from 'react';
import { User } from './types';
import { api } from './services/api';
import { Toast } from './components/Toast';
import { Login } from './pages/Login';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AddStaffModal } from './pages/AdminDashboard/AddStaffModal';
import { DeleteConfirmModal } from './pages/AdminDashboard/DeleteConfirmModal';
import { useAttendance } from './hooks/useAttendance';
import { useAdmin } from './hooks/useAdmin';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState<'login' | 'staff' | 'admin'>('login');
  const [mobileInput, setMobileInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await api.login(mobileInput, passwordInput);
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      showToast(`Welcome back, ${user.name}!`);
    } catch (err: any) {
      showToast(err.message || 'Invalid credentials or inactive account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      try {
        await api.logout(currentUser.id);
      } catch (err) {
        console.error('Logout tracking failed:', err);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('user');
    setView('login');
    setMobileInput('');
    setPasswordInput('');
  };

  useEffect(() => {
    if (currentUser) {
      setView(currentUser.role === 'admin' ? 'admin' : 'staff');
    } else {
      setView('login');
    }
  }, [currentUser]);

  const attendance = useAttendance(currentUser, showToast);
  const admin = useAdmin(currentUser, showToast);

  return (
    <>
      {view === 'login' && (
        <Login 
          mobileInput={mobileInput} 
          setMobileInput={setMobileInput} 
          passwordInput={passwordInput}
          setPasswordInput={setPasswordInput}
          handleLogin={handleLogin} 
          isLoading={isLoading} 
          showToast={showToast}
        />
      )}

      {view === 'staff' && (
        <StaffDashboard 
          currentUser={currentUser}
          handleLogout={handleLogout}
          {...attendance}
        />
      )}

      {view === 'admin' && (
        <AdminDashboard 
          currentUser={currentUser}
          handleLogout={handleLogout}
          {...admin}
        />
      )}

      <AddStaffModal 
        show={admin.showAddStaff}
        onClose={() => {
          admin.setShowAddStaff(false);
          admin.setStaffToEdit(null);
        }}
        isEditing={!!admin.staffToEdit}
        newStaff={admin.newStaff}
        setNewStaff={admin.setNewStaff}
        onSubmit={admin.handleAddStaff}
      />

      <DeleteConfirmModal 
        staff={admin.staffToDelete}
        onClose={() => admin.setStaffToDelete(null)}
        onConfirm={admin.handleDeleteStaff}
      />

      <Toast toast={toast} />
    </>
  );
}
