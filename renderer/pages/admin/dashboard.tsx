import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { AdminDashboardStats, User, Subscription } from '../../types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [activateData, setActivateData] = useState({
    user_id: 0,
    months: 12,
    price: 0,
  });

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get<AdminDashboardStats>('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.get<User[]>('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/activate-subscription', activateData);
      setShowActivateModal(false);
      fetchStats();
      fetchUsers();
      setActivateData({ user_id: 0, months: 12, price: 0 });
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const openActivateModal = (user: User) => {
    setSelectedUser(user);
    setActivateData({ ...activateData, user_id: user.id });
    setShowActivateModal(true);
  };

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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">لوحة تحكم المدير</h1>
        <p className="text-slate-500 text-sm mt-1">إدارة العيادات والاشتراكات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Clinics - Blue */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1 font-medium">إجمالي العيادات</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-sm">{stats?.total_clinics || 0}</h3>
            </div>
            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center text-3xl shadow-inner">
              🏥
            </div>
          </div>
        </div>

        {/* Card 2: Active Subs - Emerald */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1 font-medium">اشتراكات نشطة</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-sm">{stats?.active_subs || 0}</h3>
            </div>
            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center text-3xl shadow-inner">
              ✅
            </div>
          </div>
        </div>

        {/* Card 3: Expired Subs - Amber */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm mb-1 font-medium">اشتراكات منتهية</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-sm">{stats?.expired_subs || 0}</h3>
            </div>
            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center text-3xl shadow-inner">
              ⚠️
            </div>
          </div>
        </div>

        {/* Card 4: Revenue - Purple */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1 font-medium">الإيرادات</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-sm">{stats?.total_revenue || '0'} ل.س</h3>
            </div>
            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center text-3xl shadow-inner">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Latest Clinics */}
      {stats?.latest_clinics && stats.latest_clinics.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-800 text-lg">آخر العيادات المنضمة</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">الاسم</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">البريد</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">الاشتراك</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">تاريخ الانضمام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.latest_clinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{clinic.name}</td>
                    <td className="px-4 py-3 text-slate-600">{clinic.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        clinic.subscription?.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {clinic.subscription?.status === 'active' ? 'نشط' : 'منتهي'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(clinic.created_at || '').toLocaleDateString('ar-SY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Clinics */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-lg">جميع العيادات</h2>
          <span className="text-sm font-semibold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">{users.length} عيادة</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">#</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">الاسم</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">البريد</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">الحالة</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    <p className="text-4xl mb-2">🏥</p>
                    <p className="font-medium">لا توجد عيادات مسجلة</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-mono">#{user.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        user.has_active_subscription
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {user.has_active_subscription ? 'نشط' : 'منتهي'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openActivateModal(user)}
                        className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-bold hover:bg-cyan-100 transition-colors border border-cyan-200"
                      >
                        تفعيل/تجديد
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activate Subscription Modal */}
      {showActivateModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">تفعيل الاشتراك</h2>
              <button
                onClick={() => setShowActivateModal(false)}
                className="text-slate-400 hover:text-red-500 transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl mb-4 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">العيادة</p>
                <p className="font-bold text-slate-800 text-lg">{selectedUser.name}</p>
                <p className="text-sm text-slate-600">{selectedUser.email}</p>
              </div>

              <form onSubmit={handleActivate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">مدة الاشتراك (شهر) *</label>
                  <div className="flex gap-2">
                    {[1, 3, 6, 12].map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setActivateData({ ...activateData, months })}
                        className={`flex-1 py-2.5 rounded-xl border-2 font-bold transition-all ${
                          activateData.months === months
                            ? 'bg-cyan-500 text-white border-cyan-500 shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        {months} شهر
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">سعر الاشتراك *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={activateData.price || ''}
                    onChange={(e) => setActivateData({ ...activateData, price: Number(e.target.value) })}
                    placeholder="المبلغ بالليرة السورية"
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-slate-800 font-semibold placeholder:text-slate-400"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowActivateModal(false)}
                    className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all shadow-md"
                  >
                    تفعيل الاشتراك
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}