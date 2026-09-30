import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';

export const AdminLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      adminService
        .getPendingSellers()
        .then((res) => {
          const sellers = res.data?.data || [];
          setPendingCount(sellers.length);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-300">Authenticating Admin Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar pendingSellersCount={pendingCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ refreshPending: () => {
              adminService.getPendingSellers().then((res) => setPendingCount((res.data?.data || []).length)).catch(() => {});
            }}} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
