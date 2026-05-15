import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { LabOrder, Patient } from '../types';

export default function LabOrdersPage() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'ordered' | 'received' | 'fitted'>('all');

  const [formData, setFormData] = useState({
    patient_id: 0,
    lab_name: '',
    work_type: '',
    tooth_number: 0,
    cost: 0,
    sent_date: '',
    expected_date: '',
  });

  useEffect(() => {
    fetchOrders();
    fetchPatients();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const data = await api.get<LabOrder[]>('/lab-orders');
      const filtered = statusFilter === 'all' ? data : data.filter(o => o.status === statusFilter);
      setOrders(filtered);
    } catch (err) {
      console.error('Error fetching lab orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await api.get<Patient[]>('/patients');
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/lab-orders', formData);
      setShowModal(false);
      fetchOrders();
      resetForm();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: 0,
      lab_name: '',
      work_type: '',
      tooth_number: 0,
      cost: 0,
      sent_date: '',
      expected_date: '',
    });
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.post(`/lab-orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert('حدث خطأ في تحديث الحالة');
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
      await api.delete(`/lab-orders/${id}`);
      fetchOrders();
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'received': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'fitted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ordered': return 'تم الطلب';
      case 'received': return 'مستلم';
      case 'fitted': return 'مركب';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ordered': return '📤';
      case 'received': return '📦';
      case 'fitted': return '✅';
      default: return '❓';
    }
  };

  const totalCost = orders.reduce((sum, o) => sum + o.cost, 0);

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
          <h1 className="text-2xl font-bold text-slate-800">طلبيات المختبر</h1>
          <p className="text-slate-500 text-sm mt-1">متابعة طلبيات المختبر والتيجان</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
        >
          <span>➕</span> طلب جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">إجمالي الطلبيات</p>
          <h3 className="text-2xl font-bold text-slate-800">{orders.length}</h3>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">قيد الانتظار</p>
          <h3 className="text-2xl font-bold text-amber-600">{orders.filter(o => o.status === 'ordered').length}</h3>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">تم الاستلام</p>
          <h3 className="text-2xl font-bold text-cyan-600">{orders.filter(o => o.status === 'received').length}</h3>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">التكلفة الإجمالية</p>
          <h3 className="text-2xl font-bold text-slate-800">{totalCost.toLocaleString()} ل.س</h3>
        </div>
      </div>

      {/* Filter */}
      <div className="flex bg-white rounded-xl border border-slate-200 p-1 w-fit">
        {[
          { value: 'all', label: 'الكل' },
          { value: 'ordered', label: 'تم الطلب' },
          { value: 'received', label: 'مستلم' },
          { value: 'fitted', label: 'مركب' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === opt.value ? 'bg-cyan-500 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <p className="text-5xl mb-4">🔬</p>
            <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد طلبيات</h3>
            <p className="text-slate-500">قم بإضافة طلب مختبر جديد</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{order.work_type}</h3>
                    <p className="text-sm text-slate-500">{order.lab_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  🗑️
                </button>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">المريض:</span>
                  <span className="font-medium">{order.patient?.full_name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">السن:</span>
                  <span className="font-medium">{order.tooth_number || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">التكلفة:</span>
                  <span className="font-bold text-slate-800">{order.cost.toLocaleString()} ل.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تاريخ الإرسال:</span>
                  <span>{new Date(order.sent_date).toLocaleDateString('ar-SY')}</span>
                </div>
                {order.expected_date && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">تاريخ التوقع:</span>
                    <span>{new Date(order.expected_date).toLocaleDateString('ar-SY')}</span>
                  </div>
                )}
              </div>

              {/* Status Progress */}
              <div className="flex items-center gap-1 mb-4">
                {['ordered', 'received', 'fitted'].map((s, i) => (
                  <React.Fragment key={s}>
                    <div className={`flex-1 h-2 rounded-full ${
                      ['ordered', 'received', 'fitted'].indexOf(order.status) >= i 
                        ? s === 'fitted' ? 'bg-emerald-400' : s === 'received' ? 'bg-cyan-400' : 'bg-amber-400'
                        : 'bg-slate-200'
                    }`} />
                    {i < 2 && <div className="w-1" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {order.status === 'ordered' && (
                  <button
                    onClick={() => updateStatus(order.id, 'received')}
                    className="flex-1 py-2 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-medium hover:bg-cyan-100 transition-colors"
                  >
                    📦 تأكيد الاستلام
                  </button>
                )}
                {order.status === 'received' && (
                  <button
                    onClick={() => updateStatus(order.id, 'fitted')}
                    className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                  >
                    ✅ تأكيد التركيب
                  </button>
                )}
                {order.status === 'fitted' && (
                  <span className="flex-1 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium text-center">
                    ✓ تم التركيب
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">طلب مختبر جديد</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المريض *</label>
                <select
                  required
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                >
                  <option value={0}>اختر المريض...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم المختبر *</label>
                <input
                  type="text"
                  required
                  value={formData.lab_name}
                  onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
                  placeholder="مثال: مختبر الأسنان الذهبي"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">نوع العمل *</label>
                <input
                  type="text"
                  required
                  value={formData.work_type}
                  onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                  placeholder="مثال: تاج زيركون، جسر، طقم كامل..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">رقم السن</label>
                  <input
                    type="number"
                    min={11}
                    max={48}
                    value={formData.tooth_number || ''}
                    onChange={(e) => setFormData({ ...formData, tooth_number: Number(e.target.value) })}
                    placeholder="مثال: 16"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">التكلفة *</label>
                  <input
                    type="number"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الإرسال *</label>
                  <input
                    type="date"
                    required
                    value={formData.sent_date}
                    onChange={(e) => setFormData({ ...formData, sent_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ التوقع</label>
                  <input
                    type="date"
                    value={formData.expected_date}
                    onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
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
                  إرسال الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}