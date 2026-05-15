import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Partner, PartnerLog } from '../types';

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'lab' | 'company'>('all');

  const [formData, setFormData] = useState({
    name: '',
    type: 'lab' as 'lab' | 'company',
    contact: '',
  });

  const [logData, setLogData] = useState({
    type: 'order' as 'order' | 'payment' | 'debt',
    amount: 0,
    note: '',
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const data = await api.get<Partner[]>('/doctor/partners');
      setPartners(data);
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerDetails = async (id: number) => {
    try {
      const data = await api.get<Partner>(`/doctor/partners/${id}`);
      setSelectedPartner(data);
    } catch (err) {
      console.error('Error fetching partner details:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/doctor/partners', formData);
      setShowModal(false);
      fetchPartners();
      resetForm();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;

    try {
      await api.post(`/doctor/partners/${selectedPartner.id}/logs`, logData);
      setShowLogModal(false);
      fetchPartnerDetails(selectedPartner.id);
      setLogData({ type: 'order', amount: 0, note: '' });
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'lab', contact: '' });
  };

  const getTypeLabel = (type: string) => {
    return type === 'lab' ? '🔬 مختبر' : '🏢 شركة';
  };

  const getTypeColor = (type: string) => {
    return type === 'lab' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getLogTypeLabel = (type: string) => {
    switch (type) {
      case 'order': return '📦 طلبية';
      case 'payment': return '💰 دفعة';
      case 'debt': return '📋 دين';
      default: return type;
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-cyan-100 text-cyan-700';
      case 'payment': return 'bg-emerald-100 text-emerald-700';
      case 'debt': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredPartners = typeFilter === 'all' ? partners : partners.filter(p => p.type === typeFilter);

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
          <h1 className="text-2xl font-bold text-slate-900">الشركاء والجهات</h1>
          <p className="text-slate-600 text-sm font-medium mt-1">إدارة المختبرات والشركات الموردة</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
        >
          <span>➕</span> جهة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-slate-600 text-sm font-medium mb-1">إجمالي الجهات</p>
          <h3 className="text-2xl font-bold text-slate-900">{partners.length}</h3>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-slate-600 text-sm font-medium mb-1">المختبرات</p>
          <h3 className="text-2xl font-bold text-purple-600">{partners.filter(p => p.type === 'lab').length}</h3>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-slate-600 text-sm font-medium mb-1">الشركات</p>
          <h3 className="text-2xl font-bold text-blue-600">{partners.filter(p => p.type === 'company').length}</h3>
        </div>
      </div>

      {/* Filter */}
      <div className="flex bg-white rounded-xl border border-slate-200 p-1 w-fit">
        {[
          { value: 'all', label: 'الكل' },
          { value: 'lab', label: '🔬 مختبرات' },
          { value: 'company', label: '🏢 شركات' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTypeFilter(opt.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              typeFilter === opt.value ? 'bg-cyan-500 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partners List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredPartners.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-5xl mb-4">🤝</p>
              <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد جهات مسجلة</h3>
              <p className="text-slate-600">قم بإضافة مختبر أو شركة جديدة</p>
            </div>
          ) : (
            filteredPartners.map((partner) => (
              <div
                key={partner.id}
                onClick={() => fetchPartnerDetails(partner.id)}
                className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer hover:shadow-md transition-all ${
                  selectedPartner?.id === partner.id ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${partner.type === 'lab' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      {partner.type === 'lab' ? '🔬' : '🏢'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{partner.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(partner.type)}`}>
                          {getTypeLabel(partner.type)}
                        </span>
                        {partner.logs && (
                          <span className="text-xs text-slate-600">{partner.logs.length} سجل</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-600">←</div>
                </div>
                {partner.contact && (
                  <p className="mt-3 text-sm text-slate-600">📞 {partner.contact}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Partner Details */}
        <div className="lg:col-span-1">
          {selectedPartner ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
              <div className={`p-6 ${selectedPartner.type === 'lab' ? 'bg-purple-50' : 'bg-blue-50'} border-b border-slate-200`}>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm mb-3">
                  {selectedPartner.type === 'lab' ? '🔬' : '🏢'}
                </div>
                <h2 className="text-center font-bold text-slate-900 text-lg">{selectedPartner.name}</h2>
                <p className="text-center text-slate-600 text-sm font-medium mt-1">{getTypeLabel(selectedPartner.type)}</p>
              </div>

              <div className="p-6">
                {selectedPartner.contact && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">التواصل</p>
                    <p className="font-medium text-slate-700">{selectedPartner.contact}</p>
                  </div>
                )}

                {/* Logs */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-700">السجلات</h3>
                    <button
                      onClick={() => setShowLogModal(true)}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      ➕ إضافة
                    </button>
                  </div>

                {selectedPartner.logs && selectedPartner.logs.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedPartner.logs.map((log: PartnerLog) => (
                      <div key={log.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLogTypeColor(log.type)}`}>
                            {getLogTypeLabel(log.type)}
                          </span>
                          <span className="text-xs text-slate-600">
                            {new Date(log.transaction_date).toLocaleDateString('ar-SY')}
                          </span>
                        </div>
                        {log.amount > 0 && (
                          <p className="font-bold text-slate-900">{log.amount.toLocaleString()} ل.س</p>
                        )}
                        {log.note && <p className="text-sm text-slate-600 mt-1">{log.note}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-600 font-medium py-4 text-sm">لا توجد سجلات</p>
                )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-600 font-medium sticky top-6">
              <p className="text-4xl mb-3">👈</p>
              <p>اختر جهة لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Partner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg">جهة جديدة</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-600 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">الاسم *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم المختبر أو الشركة"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">النوع *</label>
                <div className="flex gap-3">
                  {(['lab', 'company'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`flex-1 py-3 rounded-xl border font-medium transition-all ${
                        formData.type === type
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type === 'lab' ? '🔬 مختبر' : '🏢 شركة'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">معلومات التواصل</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="هاتف / بريد / عنوان"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Log Modal */}
      {showLogModal && selectedPartner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg">سجل جديد - {selectedPartner.name}</h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-600 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">نوع السجل *</label>
                <div className="flex gap-2">
                  {(['order', 'payment', 'debt'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLogData({ ...logData, type })}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        logData.type === type
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {getLogTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">المبلغ</label>
                <input
                  type="number"
                  min={0}
                  value={logData.amount || ''}
                  onChange={(e) => setLogData({ ...logData, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">ملاحظات</label>
                <textarea
                  rows={3}
                  value={logData.note}
                  onChange={(e) => setLogData({ ...logData, note: e.target.value })}
                  placeholder="تفاصيل السجل..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  حفظ السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}