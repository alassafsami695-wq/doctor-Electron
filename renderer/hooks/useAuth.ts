import { useState, useEffect, useCallback } from 'react';
import { getToken, authApi } from '../lib/api';
import type { User } from '../types';

let globalUser: User | null = null;
let listeners: Set<(user: User | null) => void> = new Set();

function notifyListeners(user: User | null) {
  globalUser = user;
  listeners.forEach(cb => cb(user));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(!globalUser && !!getToken());

  useEffect(() => {
    listeners.add(setUser);
    return () => { listeners.delete(setUser); };
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      notifyListeners(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData = await authApi.getUser();
      notifyListeners({ ...userData, permissions: userData.permissions || [] });
    } catch (err) {
      notifyListeners(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!globalUser && getToken()) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const logout = useCallback(() => {
    notifyListeners(null);
  }, []);

  return {
    user,
    loading,
    refreshUser,
    logout,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    isDoctor: user?.role === 'doctor',
    isStaff: user?.role === 'staff',
  };
}