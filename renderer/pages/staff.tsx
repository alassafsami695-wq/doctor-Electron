import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Staff } from '../types';

interface PermissionOption {
  key: string;
  label: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [permissions, setPermissions] = useState<PermissionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: [] as string[],
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchPermissions();
    fetchStaff();
  }, []);

  const fetchPermissions = async () => {
    try {
      const data = await api.get<{ permissions: Record<string, string> }>('/staff/permissions');
      const perms = Object.entries(data.permissions).map(([key, label]) => ({ key, label }));
      setPermissions(perms);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await api.get<{ staff: Staff[] }>('/staff');
      setStaff(data.staff || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', permissions: [], is_active: true });
    setErrors({});
    setEditMode(false);
    setCurrentId(null);
  };

  const handleOpenModal = (member?: Staff) => {
    if (member) {
      setEditMode(true);
      setCurrentId(member.id);
      setFormData({
        name: member.name,
        email: member.email,
        password: '',
        permissions: member.permissions || [],
        is_active: member.is_active ?? true,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleTogglePermission = (permKey: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter(p => p !== permKey)
        : [...prev.permissions, permKey]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (editMode && currentId) {
        await api.post(`/staff/${currentId}`, formData);
      } else {
        await api.post('/staff/create', formData);
      }
      setShowModal(false);
      fetchStaff();
      resetForm();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert(err.message || 'حدث خطأ أثناء الحفظ');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleToggleStatus = async (member: Staff) => {
    try {
      await api.post(`/staff/${member.id}`, { is_active: !member.is_active });
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  // Permission label mapper
  const getPermissionLabel = (key: string) => {
    const perm = permissions.find(p => p.key === key);
    return perm?.label || key;
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
          <h1 className="text-2xl font-bold text-slate-800">إدارة الموظفين</h1>
          <p className="text-slate-500 text-sm mt-1">إدارة حسابات السكرتارية والموظفين وصلاحياتهم</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
        >
          <span>➕</span> موظف جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">إجمالي الموظفين</p>
          <h3 className="text-2xl font-bold text-slate-800">{staff.length}</h3>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">النشطين</p>
          <h3 className="text-2xl font-bold text-emerald-600">{staff.filter(s => s.is_active).length}</h3>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">المعطلين</p>
          <h3 className="text-2xl font-bold text-red-600">{staff.filter(s => !s.is_active).length}</h3>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-slate-600">#</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">الاسم</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">البريد</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">الصلاحيات</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <p className="text-4xl mb-2">👥</p>
                    <p>لا يوجد موظفين مسجلين</p>
                  </td>
                </tr>
              ) : (
                staff.map((member, index) => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{member.name}</td>
                    <td className="px-4 py-3 text-slate-500">{member.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {member.permissions?.map((perm, i) => (
                          <span key={i} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs">
                            {getPermissionLabel(perm)}
                          </span>
                        )) || <span className="text-slate-400 text-xs">بدون صلاحيات</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                          member.is_active 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {member.is_active ? 'نشط' : 'معطل'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(member)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
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
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">
                {editMode ? 'تعديل موظف' : 'موظف جديد'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {editMode ? 'كلمة المرور (اتركها فارغة إذا لم ترد التغيير)' : 'كلمة المرور *'}
                </label>
                <input
                  type="password"
                  required={!editMode}
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الصلاحيات *</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl">
                  {permissions.map((perm) => (
                    <label
                      key={perm.key}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        formData.permissions.includes(perm.key)
                          ? 'bg-cyan-50 border border-cyan-200'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.key)}
                        onChange={() => handleTogglePermission(perm.key)}
                        className="w-4 h-4 text-cyan-500 rounded border-slate-300 focus:ring-cyan-400"
                      />
                      <span className="text-sm text-slate-700">{perm.label}</span>
                    </label>
                  ))}
                </div>
                {errors.permissions && <p className="text-red-500 text-xs mt-1">{errors.permissions[0]}</p>}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded border-slate-300 focus:ring-cyan-400"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700">الحساب نشط</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  {editMode ? 'حفظ التغييرات' : 'إنشاء الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}