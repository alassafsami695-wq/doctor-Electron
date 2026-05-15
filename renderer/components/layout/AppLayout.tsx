import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { removeToken, getToken } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types';
import { Toaster } from 'react-hot-toast';

interface AppLayoutProps {
  children: React.ReactNode;
  user?: User | null;
}

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  permissions: string[];
  roles?: string[];
}

// ✅ Doctor/Staff menu items (NOT for super_admin)
const menuItems: MenuItem[] = [
  { 
    label: '📊 لوحة التحكم', 
    href: '/dashboard', 
    icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    permissions: ['view_dashboard'],
    roles: ['doctor', 'staff', 'receptionist']
  },
  { 
    label: '👤 المرضى', 
    href: '/patients', 
    icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    permissions: ['view_patients', 'add_patients', 'edit_patients', 'delete_patients'],
    roles: ['doctor', 'staff', 'receptionist']
  },
  { 
    label: '📅 المواعيد', 
    href: '/appointments', 
    icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z',
    permissions: ['manage_appointments'],
    roles: ['doctor', 'staff', 'receptionist']
  },
  { 
    label: '💰 الفواتير', 
    href: '/invoices', 
    icon: 'M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12zM8 8h2v8H8V8zm4 0h2v8h-2V8z',
    permissions: ['view_invoices', 'create_invoices', 'manage_payments'],
    roles: ['doctor', 'staff', 'receptionist']
  },
  { 
    label: '🤝 الشركات و المخابر', 
    href: '/partners', 
    icon: 'M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    permissions: ['view_partners'],
    roles: ['doctor', 'staff', 'receptionist']
  },
  { 
    label: '📉 المصاريف', 
    href: '/expenses', 
    icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
    permissions: ['view_expenses', 'manage_expenses'],
    roles: ['doctor', 'staff', 'receptionist']
  },
  { 
    label: '👥 الموظفين', 
    href: '/staff', 
    icon: 'M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    permissions: ['manage_staff'],
    roles: ['doctor', 'staff', 'receptionist']
  },
];

// ✅ Super Admin ONLY menu items
const adminMenuItems: MenuItem[] = [
  { 
    label: '📊 لوحة التحكم', 
    href: '/admin/dashboard', 
    icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    permissions: [],
    roles: ['super_admin']
  },
  { 
    label: '🏢 العيادات', 
    href: '/admin/clinics', 
    icon: 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z',
    permissions: [],
    roles: ['super_admin']
  },
  { 
    label: '💳 الاشتراكات', 
    href: '/admin/subscriptions', 
    icon: 'M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12zM8 8h2v8H8V8zm4 0h2v8h-2V8z',
    permissions: [],
    roles: ['super_admin']
  },
];

// ✅ FIXED: Check if menu item is visible for user's role
function isItemVisibleForRole(user: User | null | undefined, item: MenuItem): boolean {
  if (!user) return false;
  
  // If item has specific roles, user must match
  if (item.roles && item.roles.length > 0) {
    return item.roles.includes(user.role);
  }
  
  // Fallback: check permissions
  const userPerms = user.permissions || [];
  return item.permissions.length === 0 || item.permissions.some(p => userPerms.includes(p));
}

// ✅ FIXED: Helper to get display role text
function getRoleDisplay(role?: string): string {
  if (!role) return 'موظف';
  
  const roleStr = String(role).toLowerCase().trim();
  
  if (roleStr === 'super_admin') return 'مدير النظام';
  if (roleStr === 'doctor' || roleStr === 'dentist') return 'طبيب أسنان';
  if (roleStr === 'receptionist' || roleStr === 'staff') return 'موظف استقبال';
  
  return 'موظف';
}

export default function AppLayout({ children, user: propUser }: AppLayoutProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const user = propUser || authUser;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleRouteChange = () => setMobileMenuOpen(false);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router]);

  // ✅ FIXED: Filter menu items by role
  const filteredMenuItems = menuItems.filter(item => isItemVisibleForRole(user, item));
  
  // ✅ FIXED: Filter admin items by role
  const filteredAdminItems = adminMenuItems.filter(item => isItemVisibleForRole(user, item));
  
  const allMenuItems = [...filteredMenuItems, ...filteredAdminItems];

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const isActivePath = (href: string) => {
    if (href === '/dashboard' || href === '/admin/dashboard') return router.pathname === href;
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  if (!getToken()) {
    return <>{children}</>;
  }

  if (!mounted) {
    return <div className="h-screen bg-slate-50" />;
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-sans" dir="rtl">
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky lg:top-0 inset-y-0 right-0 z-40
          bg-slate-900 text-white h-screen
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-72' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          flex flex-col shadow-2xl overflow-visible
        `}
      >
        {/* Logo Area */}
        <div className="h-20 shrink-0 flex items-center justify-center border-b border-slate-700/50 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xl shadow-lg shrink-0">
              🦷
            </div>
            {sidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-lg leading-tight whitespace-nowrap">Smart Clinic</span>
                <span className="text-xs text-slate-400">v2.0</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - FILTERED BY ROLE */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {allMenuItems.length === 0 ? (
            <div className="px-3 py-4 text-center text-slate-500 text-sm">
              لا توجد صفحات متاحة
            </div>
          ) : (
            allMenuItems.map((item) => {
              const active = isActivePath(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                    ${active 
                      ? 'bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-400' 
                      : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                    }
                  `}
                >
                  <svg 
                    className={`w-5 h-5 shrink-0 ${active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'}`} 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d={item.icon} />
                  </svg>
                  {sidebarOpen && (
                    <span className="font-medium text-sm truncate">{item.label}</span>
                  )}
                </Link>
              );
            })
          )}
        </nav>

        {/* User Section */}
        <div className="shrink-0 border-t border-slate-700/50 p-4 bg-slate-900">
          <div className={`
            flex items-center gap-3 p-2 rounded-xl bg-slate-800/50
            ${!sidebarOpen && 'justify-center'}
          `}>
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.name || 'المستخدم'}</p>
                <p className="text-xs text-slate-400">
                  {getRoleDisplay(user?.role)}
                </p>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              تسجيل الخروج
            </button>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -left-3.5 w-7 h-7 bg-white border-2 border-slate-200 rounded-full items-center justify-center text-slate-600 shadow-lg hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all duration-300 z-50 cursor-pointer"
          aria-label={sidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
        >
          <svg 
            className={`w-3.5 h-3.5 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : 'rotate-0'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-slate-800 font-bold hidden sm:block text-lg">نظام إدارة العيادات </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{user?.name || 'المستخدم'}</p>
                <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">
                  {getRoleDisplay(user?.role)}
                </p>
              </div>
              <div className="relative">
                <button className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <Toaster
        position="top-left"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontFamily: 'inherit',
          },
        }}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.4);
        }
      `}</style>
    </div>
  );
}