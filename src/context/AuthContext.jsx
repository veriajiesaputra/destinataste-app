import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('destinataste_token') || null);
  const [loading, setLoading] = useState(true);

  // Role: 'admin', 'pengguna', atau 'pengunjung' (default jika belum login)
  const role = user ? user.role : 'pengunjung';

  // Verifikasi token saat pertama kali aplikasi dibuka
  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const userData = await getMe(token);
          setUser(userData);
        } catch (error) {
          console.warn('Sesi login telah kedaluwarsa:', error.message);
          localStorage.removeItem('destinataste_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  // Fungsi Login
  const login = async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem('destinataste_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // Fungsi Register
  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    localStorage.setItem('destinataste_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // Fungsi Logout
  const logout = () => {
    localStorage.removeItem('destinataste_token');
    setToken(null);
    setUser(null);
  };

  // Fungsi Update Sesi User saat Edit Profil
  const updateUserSession = (newUser, newToken) => {
    setUser(newUser);
    if (newToken) {
      localStorage.setItem('destinataste_token', newToken);
      setToken(newToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        register,
        logout,
        updateUserSession,
        isAdmin: role === 'admin',
        isPengguna: role === 'pengguna',
        isPengunjung: role === 'pengunjung',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
