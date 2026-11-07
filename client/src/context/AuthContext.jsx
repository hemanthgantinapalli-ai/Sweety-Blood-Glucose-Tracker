import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sweety_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sweety_token'));
  const [loading, setLoading] = useState(true);

  // Verify token on mount and refresh user info
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('sweety_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('sweety_user', JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.error('Session verification failed:', error?.response?.data?.message || error.message);
        localStorage.removeItem('sweety_token');
        localStorage.removeItem('sweety_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;

    localStorage.setItem('sweety_token', newToken);
    localStorage.setItem('sweety_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return response.data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword,
    });
    const { token: newToken, user: userData } = response.data;

    localStorage.setItem('sweety_token', newToken);
    localStorage.setItem('sweety_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('sweety_token');
    localStorage.removeItem('sweety_user');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

