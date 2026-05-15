import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Subscription, User } from '../../types';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [activateData, setActivateData] = useState({
    user_id: 0,
    months: 12,
    price: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        api.get<{
          all_subscriptions: Subscription[];
          active_subscriptions: number;
          total_clinics: number;
        }>('/admin/stats'), // ✅ استخدم /admin/stats الموحد
        api.get<User[]>('/admin/users'),
      ]);
      
      // ✅ استخدم all_subscriptions بدلاً من expiring_soon فقط
      setSubscriptions(statsData.all_subscriptions || []);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.name || `عيادة #${userId}`;
  };

  const getUserEmail = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.email || '';
  };

  const getDaysRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusBadge = (subscription: Subscription) => {
    const days = getDaysRemaining(subscription.ends_at);
    
    if (subscription.status === 'expired') {
      return { label: 'منتهي', class: 'bg-red-100 text-red-700 border-red-200' };
    }
    if (days <= 7 && days > 0) {
      return { label: `ينتهي خلال ${days} يوم`, class: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
    if (days <= 0) {
      return { label: 'منتهي', class: 'bg-red-100 text-red-700 border-red-200' };
    }
    return { label: 'نشط', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/activate-subscription', activateData);
      setShowActivateModal(false);
      fetchData();
      setActivateData({ user_id: 0, months: 12, price: 0 });
      setSelectedUser(null);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const openActivateModal = (user: User) => {
    setSelectedUser(user);
    setActivateData({ ...activateData, user_id: user.id });
    setShowActivateModal(true);
  };

  const filteredSubscriptions = statusFilter === 'all' 
    ? subscriptions 
    : statusFilter === 'expiring'
    ? subscriptions.filter(s => {
        const days = getDaysRemaining(s.ends_at);
        return s.status === 'active' && days <= 7 && days > 0;
      })
    : subscriptions.filter(s => s.status === statusFilter);

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const expiredCount = subscriptions.filter(s => s.status === 'expired').length;
  const expiringCount = subscriptions.filter(s => {
    const days = getDaysRemaining(s.ends_at);
    return s.status === 'active' && days <= 7 && days > 0;
  }).length;

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الاشتراكات</h1>
          <p className="text-slate-500 text-sm mt-1">متابعة حالة الاشتراكات والتجديدات</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1 font-medium">النشطة</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-sm">{activeCount}</h3>
            </div>
            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center text-3xl shadow-inner">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm mb-1 font-medium">تنتهي قريباً</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-sm">{expiringCount}</h3>
            </div>
            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center text-3xl shadow-inner">
              ⏰
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm mb-1 font-medium">المنتهية</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-sm">{expiredCount}</h3>
            </div>
            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center text-3xl shadow-inner">
              ⚠️
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1 font-medium">إجمالي الاشتراكات</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-sm">{subscriptions.length}</h3>
            </div>
            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center text-3xl shadow-inner">
              📊
            </div>
          </div>
        </div>
      </div>

      {/* Quick Activate Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4 text-lg">تفعيل سريع</h2>
        <div className="flex flex-wrap gap-3">
          {users.filter(u => !u.has_active_subscription).slice(0, 5).map((user) => (
            <div key={user.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold shadow-sm">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-600">{user.email}</p>
              </div>
              <button
                onClick={() => openActivateModal(user)}
                className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700 transition-colors shadow-sm"
              >
                تفعيل
              </button>
            </div>
          ))}
          {users.filter(u => !u.has_active_subscription).length === 0 && (
            <p className="text-slate-600 text-sm font-medium">جميع العيادات لديها اشتراكات نشطة ✅</p>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex bg-white rounded-xl border border-slate-200 p-1 w-fit">
        {[
          { value: 'all', label: 'الكل' },
          { value: 'active', label: 'نشط' },
          { value: 'expiring', label: 'ينتهي قريباً' },
          { value: 'expired', label: 'منتهي' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              statusFilter === opt.value ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-lg">سجل الاشتراكات</h2>
          <span className="text-sm font-semibold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">{filteredSubscriptions.length} اشتراك</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">العيادة</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">الحالة</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">تاريخ البدء</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">تاريخ الانتهاء</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">المدة</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">الأيام المتبقية</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <p className="text-4xl mb-2">📅</p>
                    <p className="font-medium">لا توجد اشتراكات في هذا الفلتر</p>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const badge = getStatusBadge(sub);
                  const daysRemaining = getDaysRemaining(sub.ends_at);
                  const user = users.find(u => u.id === sub.user_id);
                  
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-800 font-bold text-xs border border-cyan-200">
                            {getUserName(sub.user_id).charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{getUserName(sub.user_id)}</p>
                            <p className="text-xs text-slate-600">{getUserEmail(sub.user_id)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.class}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {new Date(sub.starts_at).toLocaleDateString('ar-SY')}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {new Date(sub.ends_at).toLocaleDateString('ar-SY')}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{sub.months_duration} شهر</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${
                          daysRemaining <= 0 ? 'text-red-600' :
                          daysRemaining <= 7 ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>
                          {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            const user = users.find(u => u.id === sub.user_id);
                            if (user) openActivateModal(user);
                          }}
                          className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-bold hover:bg-cyan-100 transition-colors border border-cyan-200"
                        >
                          تجديد
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activate/Renew Modal */}
      {showActivateModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">
                {selectedUser.has_active_subscription ? 'تجديد الاشتراك' : 'تفعيل الاشتراك'}
              </h2>
              <button
                onClick={() => {
                  setShowActivateModal(false);
                  setSelectedUser(null);
                }}
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
                            ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
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
                    onClick={() => {
                      setShowActivateModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all shadow-md"
                  >
                    {selectedUser.has_active_subscription ? 'تجديد' : 'تفعيل'}
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