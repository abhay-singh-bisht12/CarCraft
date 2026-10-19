import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logoutUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('carcraft_token') || null);
  const [loading, setLoading] = useState(true);

  // On page reload, restore authentication only if the backend can securely verify the existing token
  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const storedToken = localStorage.getItem('carcraft_token');

      // If no token exists, immediately mark as unauthenticated
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        // Query backend /api/me/ to verify token validity in the database
        const data = await getMe(storedToken);
        if (isMounted && data && data.user) {
          setUser(data.user);
          setToken(storedToken);
        }
      } catch (err) {
        // Invalid or expired token: clear storage and reset state
        if (isMounted) {
          localStorage.removeItem('carcraft_token');
          localStorage.removeItem('carcraft_user');
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Set authentication state immediately after successful login
   */
  const login = (authToken, userData) => {
    localStorage.setItem('carcraft_token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  /**
   * Update current user in memory immediately upon profile update
   */
  const updateUser = (updatedUser) => {
    setUser((prev) => ({
      ...prev,
      ...updatedUser,
    }));
  };

  /**
   * Logout user, invalidate backend token, and reset frontend auth state
   */
  const logout = async () => {
    const currentToken = token || localStorage.getItem('carcraft_token');
    try {
      if (currentToken) {
        await logoutUser(currentToken);
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('carcraft_token');
      localStorage.removeItem('carcraft_user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
