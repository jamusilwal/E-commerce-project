import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/adminService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('adminUser');
      const token = localStorage.getItem('adminAccessToken');
      return saved && token ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('adminAccessToken');
      if (token) {
        try {
          const res = await authService.getMe();
          const userData = res.data?.data;
          if (userData?.role === 'ADMIN') {
            setAdmin(userData);
            localStorage.setItem('adminUser', JSON.stringify(userData));
          } else {
            // Not an admin
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminUser');
            setAdmin(null);
          }
        } catch (err) {
          const status = err.response?.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminUser');
            setAdmin(null);
          }
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      const { user: userData, accessToken } = res.data.data;

      if (userData?.role !== 'ADMIN') {
        toast.error('Access Denied: This portal is restricted to Administrators only.');
        throw new Error('Not an administrator');
      }

      localStorage.setItem('adminAccessToken', accessToken);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      setAdmin(userData);
      toast.success(`Welcome back, ${userData.firstName || 'Admin'}!`);
      return userData;
    } catch (err) {
      if (err.message === 'Not an administrator') {
        throw err;
      }
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Authentication failed. Please check credentials.';
      toast.error(errorMsg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue cleanup
    } finally {
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminUser');
      setAdmin(null);
      toast.success('Logged out from Admin Portal');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin && admin.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
