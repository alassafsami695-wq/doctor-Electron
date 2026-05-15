import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Expense } from '../types';

const EXPENSE_CATEGORIES = [
  { value: 'salaries', label: '💼 رواتب', color: 'bg-blue-100 text-blue-800' },
  { value: 'materials', label: '🧪 مواد طبية', color: 'bg-purple-100 text-purple-800' },
  { value: 'rent', label: '🏠 إيجار', color: 'bg-amber-100 text-amber-800' },
  { value: 'utilities', label: '⚡ فواتير', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'equipment', label: '🔧 صيانة معدات', color: 'bg-red-100 text-red-800' },
  { value: 'marketing', label: '📢 تسويق', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'other', label: '📌 أخرى', color: 'bg-slate-100 text-slate-800' },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    category: 'materials',
    amount: 0,
    expense_date: '',
    description: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await api.get<Expense[]>('/expenses');
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', formData);
      setShowModal(false);
      fetchExpenses();
      resetForm();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'materials',
      amount: 0,
      expense_date: '',
      description: '',
    });
  };

  const deleteExpense = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const getCategoryLabel = (cat: string) => {
    return EXPENSE_CATEGORIES.find(c => c.value === cat)?.label || cat;
  };

  const getCategoryColor = (cat: string) => {
    return EXPENSE_CATEGORIES.find(c => c.value === cat)?.color || 'bg-slate-100 text-slate-800';
  };

  const filteredExpenses = categoryFilter === 'all' 
    ? expenses 
    : expenses.filter(e => e.category === categoryFilter);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const categoryTotals = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value).reduce((sum, e) => sum + e.amount, 0),
    count: expenses.filter(e => e.category === cat.value).length,
  })).filter(c => c.total > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المصاريف</h1>
          <p className="text-slate-600 text-sm mt-1 font-medium">تتبع وإدارة مصاريف العيادة</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2"
        >
          <span>➕</span> مصروف جديد
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm mb-1 font-medium">إجمالي المصاريف</p>
            <h2 className="text-3xl font-bold">{totalExpenses.toLocaleString()} ل.س</h2>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
            📉
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categoryTotals.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(categoryFilter === cat.value ? 'all' : cat.value)}
              className={`p-4 rounded-xl border transition-all text-center ${
                categoryFilter === cat.value 
                  ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-white shadow-sm' 
                  : 'border-slate-200 bg-white hover:shadow-md'
              }`}
            >
              <div className={`inline-block px-2 py-1 rounded-lg text-xs font-bold mb-2 ${cat.color}`}>
                {cat.label}
              </div>
              <p className="font-bold text-slate-900">{cat.total.toLocaleString()}</p>
              <p className="text-xs text-slate-600 font-medium">{cat.count} عملية</p>
            </button>
          ))}
        </div>
      )}

      {/* Filter Indicator */}
      {categoryFilter !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-700 font-medium">الفلتر:</span>
          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getCategoryColor(categoryFilter)}`}>
            {getCategoryLabel(categoryFilter)}
          </span>
          <button
            onClick={() => setCategoryFilter('all')}
            className="text-sm text-cyan-700 hover:text-cyan-800 font-bold"
          >
            إلغاء الفلتر ✕
          </button>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right font-bold text-slate-700">#</th>
                <th className="px-4 py-3 text-right font-bold text-slate-700">الفئة</th>
                <th className="px-4 py-3 text-right font-bold text-slate-700">المبلغ</th>
                <th className="px-4 py-3 text-right font-bold text-slate-700">الوصف</th>
                <th className="px-4 py-3 text-right font-bold text-slate-700">التاريخ</th>
                <th className="px-4 py-3 text-right font-bold text-slate-700">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-600 font-medium">
                    <p className="text-4xl mb-2">📉</p>
                    <p>لا توجد مصاريف مسجلة</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">#{expense.id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${getCategoryColor(expense.category)}`}>
                        {getCategoryLabel(expense.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-red-700 text-lg">{expense.amount.toLocaleString()} ل.س</td>
                    <td className="px-4 py-3 text-slate-700">{expense.description || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {new Date(expense.expense_date).toLocaleDateString('ar-SY')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg">مصروف جديد</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-600 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">الفئة *</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                        formData.category === cat.value
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm'
                          : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">المبلغ *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-bold text-lg placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">التاريخ *</label>
                <input
                  type="date"
                  required
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="تفاصيل المصروف..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  حفظ المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}