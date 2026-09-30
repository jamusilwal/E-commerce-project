import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved && localStorage.getItem('accessToken') ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        } catch (err) {
          // Only sign out when the server rejects the session. Network errors,
          // rate limits (429) or server errors keep the cached user signed in.
          const status = err.response?.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      const { user: userData, accessToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Logged in successfully!');
      return userData;
    } catch (err) {
      const errorList = err.response?.data?.errors;
      let msg = 'Login failed';
      if (errorList?.length) {
        msg = errorList.map((e) => e.message).join(', ');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message === 'Network Error' || !err.response) {
        msg = 'Cannot connect to the server. Make sure the backend (npm run dev in /server) is running.';
      } else {
        msg = err.message;
      }
      toast.error(msg);
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const res = await authService.register(formData);
      const { user: userData, accessToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Account created successfully!');
      return userData;
    } catch (err) {
      const errorList = err.response?.data?.errors;
      let msg = 'Registration failed';
      if (errorList?.length) {
        msg = errorList.map((e) => e.message).join(', ');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message === 'Network Error' || !err.response) {
        msg = 'Cannot connect to the server. Make sure the backend (npm run dev in /server) is running.';
      } else {
        msg = err.message;
      }
      toast.error(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue cleanup even if server call fails
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out');
    }
  };

  // Re-read the signed-in user (e.g. after the server changes their role)
  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.data);
      localStorage.setItem('user', JSON.stringify(res.data.data));
      return res.data.data;
    } catch {
      return null;
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await authService.updateProfile(data);
      const updatedUser = { ...user, ...res.data.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated!');
      return updatedUser;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'CUSTOMER',
        isSeller: user?.role === 'SELLER',
        isAdmin: user?.role === 'ADMIN',
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
