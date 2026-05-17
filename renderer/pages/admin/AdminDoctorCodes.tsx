import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface DoctorCode {
  id: number;
  code: string;
  is_used: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export default function AdminDoctorCodes() {
  const [codes, setCodes] = useState<DoctorCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<DoctorCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    expires_in_days: 30,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const data = await api.get<DoctorCode[]>('/admin/doctor-codes');
      setCodes(data);
    } catch (err) {
      console.error('Error fetching doctor codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!createForm.expires_in_days || createForm.expires_in_days < 1) {
      errors.expires_in_days = 'عدد الأيام يجب أن يكون 1 على الأقل';
    }
    if (createForm.expires_in_days > 365) {
      errors.expires_in_days = 'عدد الأيام يجب أن لا يتجاوز 365';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await api.post('/admin/doctor-codes', {
        expires_in_days: Number(createForm.expires_in_days),
      });
      setShowCreateModal(false);
      setCreateForm({ expires_in_days: 30 });
      fetchCodes();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء إنشاء الرمز');
    }
  };

  const handleDelete = async () => {
    if (!selectedCode) return;
    try {
      await api.delete(`/admin/doctor-codes/${selectedCode.id}`);
      setShowDeleteModal(false);
      setSelectedCode(null);
      fetchCodes();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const getStatusBadge = (code: DoctorCode) => {
    if (code.is_used) {
      return { label: 'مستخدم', class: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
    const expiry = new Date(code.expires_at);
    if (expiry <= new Date()) {
      return { label: 'منتهي الصلاحية', class: 'bg-red-100 text-red-700 border-red-200' };
    }
    const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
      return { label: `ينتهي خلال ${daysLeft} يوم`, class: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
    return { label: 'نشط', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  const getDaysRemaining = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const diff = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const activeCodes = codes.filter(c => !c.is_used && new Date(c.expires_at) > new Date()).length;
  const usedCodes = codes.filter(c => c.is_used).length;
  const expiredCodes = codes.filter(c => !c.is_used && new Date(c.expires_at) <= new Date()).length;

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
          <h1 className="text-2xl font-bold text-slate-800">رموز التسجيل</h1>
          <p className="text-slate-500 text-sm mt-1">إنشاء وإدارة رموز التسجيل للأطباء الجدد</p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setCreateForm({ expires_in_days: 30 });
            setFormErrors({});
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all shadow-md flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          إنشاء رمز جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1 font-medium">نشطة</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-sm">{activeCodes}</h3>
            </div>
            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center text-3xl shadow-inner">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1 font-medium">مستخدمة</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-sm">{usedCodes}</h3>
            </div>
            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center text-3xl shadow-inner">
              👤
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm mb-1 font-medium">منتهية الصلاحية</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-sm">{expiredCodes}</h3>
            </div>
            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center text-3xl shadow-inner">
              ⚠️
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-amber-600 text-xl mt-0.5">💡</span>
        <div>
          <p className="text-sm font-bold text-amber-800">كيف يعمل نظام الرموز؟</p>
          <p className="text-sm text-amber-700 mt-1 leading-relaxed">
            يقوم الأدمن بإنشاء رمز فريد لكل طبيب جديد. الرمز صالح لطبيب واحد فقط وله تاريخ انتهاء.
            عند التسجيل، يدخل الطبيب الرمز ويتم تسجيله مباشرة دون الحاجة لتأكيد البريد الإلكتروني.
          </p>
        </div>
      </div>

      {/* Codes Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-lg">سجل الرموز</h2>
          <span className="text-sm font-semibold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">{codes.length} رمز</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">الرمز</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">الحالة</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">تاريخ الإنشاء</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">تاريخ الانتهاء</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">الأيام المتبقية</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <p className="text-4xl mb-2">🔑</p>
                    <p className="font-medium">لا توجد رموز مسجلة</p>
                    <p className="text-sm mt-1">انقر على "إنشاء رمز جديد" لإضافة رمز</p>
                  </td>
                </tr>
              ) : (
                codes.map((code) => {
                  const badge = getStatusBadge(code);
                  const daysRemaining = getDaysRemaining(code.expires_at);
                  return (
                    <tr key={code.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 px-3 py-1.5 rounded-lg font-mono font-bold text-slate-800 text-sm border border-slate-200 tracking-wider">
                            {code.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="text-slate-400 hover:text-cyan-600 transition-colors p-1 rounded hover:bg-cyan-50"
                            title="نسخ الرمز"
                          >
                            {copiedCode === code.code ? (
                              <span className="text-emerald-500 text-xs font-bold">✓ تم النسخ</span>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.class}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {new Date(code.created_at).toLocaleDateString('ar-SY')}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {new Date(code.expires_at).toLocaleDateString('ar-SY')}
                      </td>
                      <td className="px-4 py-3">
                        {code.is_used ? (
                          <span className="text-slate-400 text-xs">—</span>
                        ) : (
                          <span className={`font-bold ${
                            daysRemaining <= 0 ? 'text-red-600' :
                            daysRemaining <= 3 ? 'text-amber-600' :
                            'text-emerald-600'
                          }`}>
                            {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedCode(code);
                            setShowDeleteModal(true);
                          }}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                          title="حذف الرمز"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">إنشاء رمز تسجيل جديد</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({ expires_in_days: 30 });
                  setFormErrors({});
                }}
                className="text-slate-400 hover:text-red-500 transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {/* Expiry Days */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  مدة الصلاحية (بالأيام) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={createForm.expires_in_days}
                  onChange={(e) => {
                    setCreateForm(prev => ({ ...prev, expires_in_days: Number(e.target.value) }));
                    setFormErrors(prev => ({ ...prev, expires_in_days: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 text-center font-bold text-lg ${
                    formErrors.expires_in_days
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-cyan-400 focus:ring-cyan-100'
                  }`}
                />
                {formErrors.expires_in_days && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.expires_in_days}</p>
                )}
                <div className="flex gap-2 mt-2">
                  {[1, 7, 30, 90, 365].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        setCreateForm(prev => ({ ...prev, expires_in_days: days }));
                        setFormErrors(prev => ({ ...prev, expires_in_days: '' }));
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                        createForm.expires_in_days === days
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {days === 1 ? 'يوم' : days === 365 ? 'سنة' : `${days} يوم`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-200">
                <p className="text-xs text-cyan-600 font-bold mb-2 uppercase tracking-wider">معلومات الرمز</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">تاريخ الإنشاء:</span>
                    <span className="font-bold text-slate-800">{new Date().toLocaleDateString('ar-SY')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">تاريخ الانتهاء:</span>
                    <span className="font-bold text-slate-800">
                      {new Date(Date.now() + createForm.expires_in_days * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SY')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">المدة:</span>
                    <span className="font-bold text-cyan-700">{createForm.expires_in_days} يوم</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ expires_in_days: 30 });
                    setFormErrors({});
                  }}
                  className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all shadow-md"
                >
                  إنشاء الرمز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">حذف الرمز</h3>
              <p className="text-slate-600 text-sm mb-1">
                هل أنت متأكد من حذف الرمز
                <code className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold mx-1">{selectedCode.code}</code>
                ؟
              </p>
              {selectedCode.is_used && (
                <p className="text-amber-600 text-xs font-bold mt-2 bg-amber-50 p-2 rounded-lg">
                  ⚠️ هذا الرمز مستخدم بالفعل! الحذف لن يؤثر على حساب الطبيب.
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md"
              >
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}