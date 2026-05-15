import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import type { ClinicStats, Appointment, Patient } from '../types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
  onClick?: () => void;
}

function StatCard({ title, value, icon, color, trend, onClick }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer ${onClick ? 'active:scale-95' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          {trend && (
            <p className="text-emerald-500 text-xs font-medium mt-1 flex items-center gap-1">
              <span>↑</span> {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ClinicStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const lowStock = stats?.alerts?.low_stock ?? 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, appointmentsData, patientsData] = await Promise.all([
          api.get<any>('/stats/clinic'),
          api.get<any>('/appointments?filter=today'),
          api.get<any>('/patients'),
        ]);
        
        const statsResult = statsData.data || statsData;
        const appointmentsArray = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.data || []);
        const patientsArray = Array.isArray(patientsData) ? patientsData : (patientsData.data || []);
        
        setStats(statsResult);
        setTodayAppointments(appointmentsArray);
        setRecentPatients(patientsArray.slice(0, 5));
      } catch (err) {
        console.error('Dashboard error:', err);
        setTodayAppointments([]);
        setRecentPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Oravue</h1>
          <p className="text-slate-500 text-sm mt-1">نظرة عامة على أداء العيادة اليوم</p>
        </div>
        <div className="text-sm text-slate-400">
          {new Date().toLocaleDateString('ar-SY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid - 3 أعمدة بدلاً من 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="المرضى"
          value={stats?.total_patients  ?? 0}
          icon="👤"
          color="bg-blue-50"
          trend={(stats?.total_patients  ?? 0) > 0 ? `${stats?.total_patients } مريض` : 'لا يوجد مرضى'}
          onClick={() => router.push('/patients')}
        />
        <StatCard
          title="مواعيد اليوم"
          value={todayAppointments.length}
          icon="📅"
          color="bg-cyan-50"
          trend={todayAppointments.length > 0 ? `${todayAppointments.length} موعد` : 'لا يوجد مواعيد'}
          onClick={() => router.push('/appointments')}
        />
        <StatCard
          title="الفواتير"
          value={stats?.total_invoices ?? 0}
          icon="💰"
          color="bg-emerald-50"
          onClick={() => router.push('/invoices')}
        />
      </div>

      {/* Alerts */}
      {lowStock > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer" onClick={() => router.push('/inventories')}>
          <span className="text-amber-500 text-xl">⚠️</span>
          <p className="text-amber-700 text-sm">
            هناك <strong>{lowStock}</strong> مواد في المخزن وصلت للحد الأدنى
          </p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div 
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-all"
          onClick={() => router.push('/appointments')}
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">مواعيد اليوم</h2>
            <span className="text-xs bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-medium">
              {todayAppointments.length} موعد
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {todayAppointments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-4xl mb-2">📭</p>
                <p>لا توجد مواعيد لهذا اليوم</p>
              </div>
            ) : (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-12 rounded-full ${
                    apt.status === 'completed' ? 'bg-emerald-400' :
                    apt.status === 'pending' ? 'bg-amber-400' :
                    apt.status === 'cancelled' ? 'bg-red-400' : 'bg-cyan-400'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{apt.patient?.full_name || 'مريض'}</p>
                    <p className="text-sm text-slate-500">
                      {apt.appointment_date ? new Date(apt.appointment_date).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                    apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-cyan-100 text-cyan-700'
                  }`}>
                    {apt.status === 'pending' ? 'معلق' :
                     apt.status === 'confirmed' ? 'مؤكد' :
                     apt.status === 'completed' ? 'منتهي' :
                     apt.status === 'cancelled' ? 'ملغى' : apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div 
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-all"
          onClick={() => router.push('/patients')}
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">آخر المرضى</h2>
            <span className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">عرض الكل</span>
          </div>
          <div className="divide-y divide-slate-50">
            {recentPatients.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-4xl mb-2">👤</p>
                <p>لا يوجد مرضى مسجلين لهذا الطبيب</p>
              </div>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold">
                    {patient.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{patient.full_name}</p>
                    <p className="text-sm text-slate-500">{patient.phone || 'لا يوجد هاتف'}</p>
                  </div>
                  <div className="text-xs text-slate-400">
                    {patient.dental_history_count ? `${patient.dental_history_count} زيارة` : 'جديد'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - 3 أزرار */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'مريض جديد', icon: '➕', href: '/patients/new', color: 'bg-blue-500 hover:bg-blue-600' },
          { label: 'موعد جديد', icon: '📅', href: '/appointments', color: 'bg-cyan-500 hover:bg-cyan-600' },
          { label: 'فاتورة جديدة', icon: '💰', href: '/invoices', color: 'bg-emerald-500 hover:bg-emerald-600' },
        ].map((action) => (
          <button
            key={action.href}
            onClick={() => router.push(action.href)}
            className={`${action.color} text-white rounded-xl p-4 text-center transition-all hover:shadow-lg active:scale-95`}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <p className="font-medium text-sm">{action.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}