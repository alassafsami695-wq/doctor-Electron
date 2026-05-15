import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { FinancialStats, Invoice, Expense } from '../types';

export default function StatisticsPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'month' | 'year'>('all');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      const [statsData, transactionsData] = await Promise.all([
        api.get<FinancialStats>('/statistics'),
        api.get<any[]>('/invoices/all-transactions'),
      ]);
      setStats(statsData);
      
      // Filter transactions by period
      let filtered = transactionsData;
      if (period === 'month') {
        const now = new Date();
        filtered = transactionsData.filter((t: any) => {
          const date = new Date(t.date);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
      } else if (period === 'year') {
        const now = new Date();
        filtered = transactionsData.filter((t: any) => {
          const date = new Date(t.date);
          return date.getFullYear() === now.getFullYear();
        });
      }
      
      setTransactions(filtered);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-slate-800">الإحصائيات المالية</h1>
          <p className="text-slate-500 text-sm mt-1">نظرة شاملة على الوضع المالي للعيادة</p>
        </div>
        <div className="flex bg-white rounded-xl border border-slate-200 p-1">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'month', label: 'هذا الشهر' },
            { value: 'year', label: 'هذه السنة' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === opt.value ? 'bg-cyan-500 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income */}
        <div className="bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1">إجمالي الإيرادات</p>
              <h3 className="text-3xl font-bold">{stats?.total_income?.toLocaleString() || 0} ل.س</h3>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
              💰
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-100">
            <span>↑</span>
            <span>المدفوعات الواردة من المرضى</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-linear-to-br from-red-500 to-rose-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm mb-1">إجمالي المصاريف</p>
              <h3 className="text-3xl font-bold">{stats?.total_expenses?.toLocaleString() || 0} ل.س</h3>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
              📉
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-red-100">
            <span>↓</span>
            <span>المصاريف التشغيلية</span>
          </div>
        </div>

        {/* Balance */}
        <div className={`rounded-2xl p-6 text-white shadow-lg ${
          (stats?.doctor_balance || 0) >= 0
            ? 'bg-linear-to-br from-blue-500 to-cyan-500'
            : 'bg-linear-to-br from-amber-500 to-orange-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">صافي الربح</p>
              <h3 className="text-3xl font-bold">{stats?.doctor_balance?.toLocaleString() || 0} ل.س</h3>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
              {(stats?.doctor_balance || 0) >= 0 ? '📈' : '⚠️'}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-100">
            <span>{(stats?.doctor_balance || 0) >= 0 ? '✅' : '⚠️'}</span>
            <span>{(stats?.doctor_balance || 0) >= 0 ? 'العيادة رابحة' : 'العيادة خاسرة'}</span>
          </div>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-bold text-slate-800 mb-6">التوازن المالي</h2>
        <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden">
          {stats && (
            <>
              {/* Income bar */}
              <div
                className="absolute top-0 right-0 h-full bg-linear-to-l from-emerald-400 to-emerald-500 transition-all duration-1000"
                style={{
                  width: `${stats.total_income > 0 
                    ? (stats.total_income / (stats.total_income + stats.total_expenses)) * 100 
                    : 0}%`,
                }}
              />
              {/* Expense bar */}
              <div
                className="absolute top-0 left-0 h-full bg-linear-to-r from-red-400 to-red-500 transition-all duration-1000"
                style={{
                  width: `${stats.total_expenses > 0 
                    ? (stats.total_expenses / (stats.total_income + stats.total_expenses)) * 100 
                    : 0}%`,
                }}
              />
            </>
          )}
        </div>
        <div className="flex justify-between mt-3 text-sm">
          <span className="text-red-600 font-medium">المصاريف</span>
          <span className="text-emerald-600 font-medium">الإيرادات</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">سجل المعاملات</h2>
          <span className="text-sm text-slate-500">{transactions.length} عملية</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-slate-600">النوع</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">الفئة</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">المبلغ</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">الوصف</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <p className="text-4xl mb-2">📊</p>
                    <p>لا توجد معاملات في هذا الفترة</p>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type === 'income' ? '💰 إيراد' : '📉 مصروف'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{transaction.category}</td>
                    <td className="px-4 py-3 font-bold">
                      <span className={transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}>
                        {transaction.amount.toLocaleString()} ل.س
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{transaction.description}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(transaction.date).toLocaleDateString('ar-SY')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}