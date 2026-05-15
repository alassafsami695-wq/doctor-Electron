import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import type { Invoice, Patient, Payment } from '../types';

export default function InvoicesPage() {
  const router = useRouter();
  const { patient: patientId } = router.query;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<'all' | 'this_month' | 'last_month' | 'last_year'>('all');

  const [formData, setFormData] = useState({
    patient_id: 0,
    total_amount: 0,
    paid_amount: 0,
    payment_method: 'cash' as 'cash' | 'card' | 'transfer',
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    payment_method: 'cash' as 'cash' | 'card' | 'transfer',
    notes: '',
  });

  useEffect(() => {
    fetchPatients();
    fetchInvoices();
  }, [periodFilter]);

  useEffect(() => {
    if (patientId && patients.length > 0) {
      setFormData(prev => ({ ...prev, patient_id: Number(patientId) }));
    }
  }, [patientId, patients]);

  const fetchInvoices = async () => {
    try {
      const endpoint = periodFilter === 'all' ? '/invoices' : `/invoices?period=${periodFilter}`;
      const data = await api.get<Invoice[]>(endpoint);
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
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

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/invoices', formData);
      setShowModal(false);
      fetchInvoices();
      resetForm();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await api.post(`/invoices/${selectedInvoice.id}/payments`, paymentData);
      setShowPaymentModal(false);
      fetchInvoices();
      setSelectedInvoice(null);
      setPaymentData({ amount: 0, payment_method: 'cash', notes: '' });
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: 0,
      total_amount: 0,
      paid_amount: 0,
      payment_method: 'cash',
      notes: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'partially_paid': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'unpaid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوعة';
      case 'partially_paid': return 'جزئي';
      case 'unpaid': return 'غير مدفوعة';
      default: return status;
    }
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + Math.max(0, inv.remaining_amount), 0);

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
          <h1 className="text-2xl font-bold text-slate-900">الفواتير والمدفوعات</h1>
          <p className="text-slate-800 font-medium text-sm mt-1">إدارة الفواتير وتسجيل المدفوعات</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
        >
          <span>➕</span> فاتورة جديدة
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-300">
          <p className="text-slate-800 text-sm mb-1 font-bold">إجمالي الإيرادات</p>
          <h3 className="text-2xl font-bold text-emerald-700 font-bold">{totalRevenue.toLocaleString('en-US')} ل.س</h3>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-300">
          <p className="text-slate-800 text-sm mb-1 font-bold">المبالغ المستحقة</p>
          <h3 className="text-2xl font-bold text-amber-700 font-bold">{totalPending.toLocaleString('en-US')} ل.س</h3>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-300">
          <p className="text-slate-800 text-sm mb-1 font-bold">عدد الفواتير</p>
          <h3 className="text-2xl font-bold text-slate-900">{invoices.length}</h3>
        </div>
      </div>

      {/* Filter */}
      <div className="flex bg-white rounded-xl border border-slate-300 p-1 w-fit">
        {[
          { value: 'all', label: 'الكل' },
          { value: 'this_month', label: 'هذا الشهر' },
          { value: 'last_month', label: 'الشهر الماضي' },
          { value: 'last_year', label: 'السنة الماضية' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriodFilter(opt.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              periodFilter === opt.value ? 'bg-cyan-500 text-white' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right font-bold text-slate-800">#</th>
                <th className="px-4 py-3 text-right font-bold text-slate-800">المريض</th>
                <th className="px-4 py-3 text-right font-bold text-slate-800">الإجمالي</th>
                <th className="px-4 py-3 text-right font-bold text-slate-800">المدفوع</th>
                <th className="px-4 py-3 text-right font-bold text-slate-800">المتبقي</th>
                <th className="px-4 py-3 text-right font-bold text-slate-800">الحالة</th>
                <th className="px-4 py-3 text-right font-bold text-slate-800">التاريخ</th>
                <th className="px-4 py-3 text-right font-bold text-slate-800">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-600 font-medium">
                    <p className="text-4xl mb-2">📭</p>
                    <p>لا توجد فواتير</p>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">#{invoice.id}</td>
                    <td className="px-4 py-3 font-medium">{invoice.patient?.full_name || '—'}</td>
                    <td className="px-4 py-3">{invoice.total_amount.toLocaleString('en-US')}</td>
                    <td className="px-4 py-3 text-emerald-700 font-bold">{invoice.paid_amount.toLocaleString('en-US')}</td>
                    <td className="px-4 py-3 text-amber-700 font-bold">{Math.max(0, invoice.remaining_amount).toLocaleString('en-US')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {new Date(invoice.created_at).toLocaleDateString('ar-SY')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-1.5 text-slate-600 hover:text-cyan-700 font-bold hover:bg-cyan-50 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          👁️
                        </button>
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowPaymentModal(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 font-bold hover:bg-emerald-50 rounded-lg transition-colors"
                            title="إضافة دفعة"
                          >
                            💰
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && !showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-300 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg">تفاصيل الفاتورة #{selectedInvoice.id}</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-800 font-bold mb-1">المريض</p>
                  <p className="font-medium">{selectedInvoice.patient?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-800 font-bold mb-1">التاريخ</p>
                  <p className="font-medium">{new Date(selectedInvoice.created_at).toLocaleDateString('ar-SY')}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
                <div className="text-center">
                  <p className="text-sm text-slate-800 font-bold mb-1">الإجمالي</p>
                  <p className="font-bold text-slate-800">{selectedInvoice.total_amount.toLocaleString('en-US')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-800 font-bold mb-1">المدفوع</p>
                  <p className="font-bold text-emerald-700 font-bold">{selectedInvoice.paid_amount.toLocaleString('en-US')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-800 font-bold mb-1">المتبقي</p>
                  <p className="font-bold text-amber-700 font-bold">{Math.max(0, selectedInvoice.remaining_amount).toLocaleString('en-US')}</p>
                </div>
              </div>
              
              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-800 mb-3">سجل المدفوعات</h3>
                  <div className="space-y-2">
                    {selectedInvoice.payments.map((payment: Payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{payment.payment_method === 'cash' ? 'نقدي' : payment.payment_method === 'card' ? 'بطاقة' : 'تحويل'}</p>
                          <p className="text-xs text-slate-800 font-medium">{new Date(payment.payment_date).toLocaleDateString('ar-SY')}</p>
                        </div>
                        <p className="font-bold text-emerald-700 font-bold">{payment.amount.toLocaleString('en-US')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  إغلاق
                </button>
                {selectedInvoice.status !== 'paid' && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    إضافة دفعة
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-300 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg">فاتورة جديدة</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">المريض *</label>
                <select
                  required
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value={0}>اختر المريض...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">المبلغ الإجمالي *</label>
                  <input
                    type="number"
                    required
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">المدفوع الآن</label>
                  <input
                    type="number"
                    value={formData.paid_amount}
                    onChange={(e) => setFormData({ ...formData, paid_amount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">طريقة الدفع</label>
                <div className="flex gap-3">
                  {(['cash', 'card', 'transfer'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData({ ...formData, payment_method: method })}
                      className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${
                        formData.payment_method === method
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {method === 'cash' ? '💵 نقدي' : method === 'card' ? '💳 بطاقة' : '🏦 تحويل'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">ملاحظات</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  إنشاء الفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-300 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg">إضافة دفعة - فاتورة #{selectedInvoice.id}</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-800 font-medium">المبلغ المتبقي:</span>
                  <span className="font-bold text-amber-700 font-bold">{Math.max(0, selectedInvoice.remaining_amount).toLocaleString('en-US')} ل.س</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">مبلغ الدفعة *</label>
                <input
                  type="number"
                  required
                  max={Math.max(0, selectedInvoice.remaining_amount)}
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">طريقة الدفع</label>
                <div className="flex gap-3">
                  {(['cash', 'card', 'transfer'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentData({ ...paymentData, payment_method: method })}
                      className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${
                        paymentData.payment_method === method
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {method === 'cash' ? '💵 نقدي' : method === 'card' ? '💳 بطاقة' : '🏦 تحويل'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">ملاحظات</label>
                <textarea
                  rows={2}
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  تسجيل الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}