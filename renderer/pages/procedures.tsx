import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Procedure } from '../types';

export default function ProceduresPage() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    default_price: 0,
  });

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    try {
      const data = await api.get<Procedure[]>('/procedures');
      setProcedures(data);
    } catch (err) {
      console.error('Error fetching procedures:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProcedure) {
        await api.post(`/procedures/${editingProcedure.id}`, formData);
      } else {
        await api.post('/procedures', formData);
      }
      setShowModal(false);
      fetchProcedures();
      resetForm();
      setEditingProcedure(null);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    try {
      await api.delete(`/procedures/${id}`);
      fetchProcedures();
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const openEditModal = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setFormData({
      name: procedure.name,
      default_price: procedure.default_price,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingProcedure(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', default_price: 0 });
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الخدمات الطبية</h1>
          <p className="text-slate-500 text-sm mt-1">إدارة قائمة العمليات والأسعار</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
        >
          <span>➕</span> خدمة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">إجمالي الخدمات</p>
          <h3 className="text-2xl font-bold text-slate-800">{procedures.length}</h3>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">أعلى سعر</p>
          <h3 className="text-2xl font-bold text-cyan-600">
            {procedures.length > 0 ? Math.max(...procedures.map(p => p.default_price)).toLocaleString() : 0} ل.س
          </h3>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">متوسط السعر</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {procedures.length > 0 
              ? Math.round(procedures.reduce((sum, p) => sum + p.default_price, 0) / procedures.length).toLocaleString() 
              : 0} ل.س
          </h3>
        </div>
      </div>

      {/* Procedures Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-slate-600">#</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">اسم الخدمة</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">السعر الافتراضي</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {procedures.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                    <p className="text-4xl mb-2">🦷</p>
                    <p>لا توجد خدمات مسجلة</p>
                  </td>
                </tr>
              ) : (
                procedures.map((procedure, index) => (
                  <tr key={procedure.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{procedure.name}</td>
                    <td className="px-4 py-3 font-bold text-cyan-600">{procedure.default_price.toLocaleString()} ل.س</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(procedure)}
                          className="p-2 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(procedure.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">
                {editingProcedure ? 'تعديل خدمة' : 'خدمة جديدة'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProcedure(null);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم الخدمة *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: حشو تجميلي، تاج زيركون..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">السعر الافتراضي *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.default_price || ''}
                  onChange={(e) => setFormData({ ...formData, default_price: Number(e.target.value) })}
                  placeholder="المبلغ بالليرة السورية"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProcedure(null);
                    resetForm();
                  }}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  {editingProcedure ? 'حفظ التعديل' : 'إضافة الخدمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}