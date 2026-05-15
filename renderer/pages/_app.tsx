import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppLayout from '../components/layout/AppLayout';
import { getToken, authApi } from '../lib/api';
import type { User } from '../types';
// @ts-ignore
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth check on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      const publicPaths = ['/login', '/register', '/forgot-password'];
      const isPublic = publicPaths.includes(router.pathname);

      if (!token && !isPublic) {
        router.push('/login');
        setLoading(false);
        return;
      }

      if (token) {
        try {
          const userData = await authApi.getUser();
          const userWithPerms: User = {
            ...userData,
            permissions: userData.permissions || [],
            role: userData.role || 'staff',
          };
          setUser(userWithPerms);

          // ✅ Redirect based on role - CHECK ON EVERY LOAD
          if (userWithPerms.role === 'staff') {
            // Staff cannot access dashboard, redirect to patients
            if (router.pathname === '/dashboard' || router.pathname === '/') {
              router.push('/patients');
            }
          } else {
            // Doctor/Admin: redirect to dashboard if on public page
            if (isPublic) {
              router.push('/dashboard');
            }
          }
        } catch (err) {
          if (!isPublic) router.push('/login');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [router.pathname]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Login page without layout
  if (router.pathname === '/login') {
    return (
      <>
        <Head>
          <title>تسجيل الدخول | Smart Clinic</title>
        </Head>
        <Component {...pageProps} />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>نظام إدارة العيادات | Smart Clinic v2.0</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AppLayout user={user}>
        <Component {...pageProps} />
      </AppLayout>
    </>
  );
}