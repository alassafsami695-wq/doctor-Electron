import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { User, Subscription } from '../../types';

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<User | null>(null);

  const [activateData, setActivateData] = useState({
    user_id: 0,
    months: 12,
    price: 0,
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const data = await api.get<User[]>('/admin/users');
      setClinics(data);
    } catch (err) {
      console.error('Error fetching clinics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/activate-subscription', activateData);
      setShowActivateModal(false);
      fetchClinics();
      setActivateData({ user_id: 0, months: 12, price: 0 });
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const openActivateModal = (clinic: User) => {
    setSelectedClinic(clinic);
    setActivateData({ ...activateData, user_id: clinic.id });
    setShowActivateModal(true);
  };

  const filteredClinics = clinics.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-slate-800">العيادات المشتركة</h1>
          <p className="text-slate-500 text-sm mt-1">إدارة ومراقبة جميع العيادات في النظام</p>
        </div>
        <div className="text-sm text-slate-600">
          إجمالي العيادات: <span className="font-bold text-slate-800">{clinics.length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث بالاسم أو البريد..."
            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Clinics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClinics.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-5xl mb-4">🏥</p>
            <h3 className="text-lg font-bold text-slate-800 mb-2">لا توجد عيادات</h3>
            <p className="text-slate-600">لم يتم تسجيل أي عيادة بعد</p>
          </div>
        ) : (
          filteredClinics.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-2xl shadow-sm">
                  🏥
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  clinic.has_active_subscription
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {clinic.has_active_subscription ? 'نشط' : 'منتهي'}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 mb-1 text-lg">{clinic.name || 'عيادة بدون اسم'}</h3>
              <p className="text-sm text-slate-600 mb-4">{clinic.email}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">الصلاحيات:</span>
                  <span className="font-semibold text-slate-800">{clinic.permissions?.length || 0} صلاحية</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الاشتراك:</span>
                  <span className={`font-bold ${clinic.has_active_subscription ? 'text-emerald-600' : 'text-red-600'}`}>
                    {clinic.has_active_subscription ? 'مفعل' : 'غير مفعل'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openActivateModal(clinic)}
                className="w-full py-2.5 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-bold hover:bg-cyan-100 transition-colors border border-cyan-200"
              >
                {clinic.has_active_subscription ? 'تجديد الاشتراك' : 'تفعيل الاشتراك'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Activate Modal */}
      {showActivateModal && selectedClinic && (
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
                <p className="font-bold text-slate-800 text-lg">{selectedClinic.name}</p>
                <p className="text-sm text-slate-600">{selectedClinic.email}</p>
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
                    onClick={() => setShowActivateModal(false)}
                    className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all shadow-md"
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