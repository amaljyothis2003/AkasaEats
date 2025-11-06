import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const register = async (email, password, displayName) => {
    try {
      setError(null);
      const response = await authService.register({ email, password, name: displayName });
      console.log('Register response:', response.data);
      
      // Get the custom token from response
      const { uid, email: userEmail, name, customToken } = response.data.data;
      const userData = { uid, email: userEmail, name };
      
      // Sign in with Firebase using the custom token
      const userCredential = await signInWithCustomToken(auth, customToken);
      const idToken = await userCredential.user.getIdToken();
      
      // Store the ID token
      localStorage.setItem('authToken', idToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      console.error('Register error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login...');
      const response = await authService.login({ email, password });
      console.log('Login response:', response.data);
      
      // Get the custom token from response
      const { user: userData, customToken } = response.data.data;
      console.log('Got customToken, signing in with Firebase...');
      
      // Sign in with Firebase using the custom token
      const userCredential = await signInWithCustomToken(auth, customToken);
      console.log('Firebase sign in successful');
      const idToken = await userCredential.user.getIdToken();
      console.log('Got ID token');
      
      // Store the ID token
      localStorage.setItem('authToken', idToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authService.updateProfile(profileData);
      const updatedUser = response.data.data;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteAccount = async () => {
    try {
      await authService.deleteAccount();
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Account deletion failed';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    deleteAccount,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
