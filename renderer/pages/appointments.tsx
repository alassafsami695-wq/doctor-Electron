import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Appointment, Patient } from '../types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today'>('all');
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_id: 0,
    appointment_date: '',
    notes: '',
    duration: 30,
    status: 'pending' as 'pending' | 'confirmed' | 'completed' | 'cancelled',
  });

  const fetchAppointments = async () => {
    try {
      const endpoint = filter === 'today' ? '/appointments?filter=today' : '/appointments';
      const response = await api.get<any>(endpoint);
      
      // ← استخراج المصفوفة من response.data
      const data = Array.isArray(response) ? response : response.data || [];
      
      console.log('Appointments response:', response);
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get<any>('/patients');
      
      // ← نفس الشيء
      const data = Array.isArray(response) ? response : response.data || [];
      
      console.log('Patients response:', response);
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/appointments', formData);
      setShowModal(false);
      fetchAppointments();
      resetForm();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const resetForm = () => {
    setFormData({
      patient_name: '',
      patient_id: 0,
      appointment_date: '',
      notes: '',
      duration: 30,
      status: 'pending',
    });
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.post(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert('حدث خطأ في تحديث الحالة');
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'confirmed': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'confirmed': return 'مؤكد';
      case 'completed': return 'منتهي';
      case 'cancelled': return 'ملغى';
      default: return status;
    }
  };

  // ← تأكد أن appointments مصفوفة قبل reduce
  const appointmentsArray = Array.isArray(appointments) ? appointments : [];
  
  // Group appointments by date
  const groupedAppointments = appointmentsArray.reduce((acc, apt) => {
    const date = new Date(apt.appointment_date).toLocaleDateString('ar-SY');
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

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
          <h1 className="text-2xl font-bold text-gray-900">إدارة المواعيد</h1>
          <p className="text-gray-600 text-sm mt-1 font-medium">جدولة ومتابعة مواعيد المرضى</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white rounded-xl border border-gray-300 p-1 shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'all' ? 'bg-cyan-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'today' ? 'bg-cyan-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              اليوم
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
          >
            <span>➕</span> موعد جديد
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        {Object.keys(groupedAppointments).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center">
            <p className="text-5xl mb-4">📭</p>
            <h3 className="text-lg font-bold text-gray-800 mb-2">لا توجد مواعيد</h3>
            <p className="text-gray-600 font-medium">قم بإضافة موعد جديد للبدء</p>
          </div>
        ) : (
          Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
            <div key={date} className="space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                {date}
                <span className="text-sm font-bold text-gray-500">({dayAppointments.length} موعد)</span>
              </h3>

              <div className="grid gap-3">
                {dayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Time */}
                      <div className="shrink-0 w-16 text-center">
                        <div className="text-lg font-black text-gray-900">
                          {new Date(apt.appointment_date).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-xs font-bold text-gray-600">{apt.duration} دقيقة</div>
                      </div>

                      {/* Divider */}
                      <div className={`w-1 h-12 rounded-full ${
                        apt.status === 'completed' ? 'bg-emerald-500' :
                        apt.status === 'cancelled' ? 'bg-red-500' :
                        apt.status === 'confirmed' ? 'bg-cyan-500' : 'bg-amber-500'
                      }`} />

                      {/* Patient Info */}
                      <div className="flex-1">
                        <h4 className="font-black text-gray-900 text-base">{apt.patient?.full_name || 'مريض'}</h4>
                        <p className="text-sm text-gray-600 font-medium mt-0.5">{apt.notes || 'لا توجد ملاحظات'}</p>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3">
                        <select
                          value={apt.status}
                          onChange={(e) => updateStatus(apt.id, e.target.value)}
                          className={`text-xs px-3 py-1.5 rounded-lg border-2 font-bold cursor-pointer ${getStatusColor(apt.status)}`}
                        >
                          <option value="pending">معلق</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="completed">منتهي</option>
                          <option value="cancelled">ملغى</option>
                        </select>

                        <button
                          onClick={() => deleteAppointment(apt.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-300">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-2xl">
              <h2 className="font-bold text-gray-900 text-lg">موعد جديد</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-900 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">اسم المريض *</label>
                <input
                  type="text"
                  required
                  list="patients-list"
                  value={formData.patient_name}
                  onChange={(e) => {
                    const selected = patients.find(p => p.full_name === e.target.value);
                    setFormData({
                      ...formData,
                      patient_name: e.target.value,
                      patient_id: selected?.id || 0,
                    });
                  }}
                  placeholder="ابحث عن مريض..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-gray-900 font-bold"
                />
                <datalist id="patients-list">
                  {patients.map((p) => (
                    <option key={p.id} value={p.full_name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">تاريخ ووقت الموعد *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-gray-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">المدة (دقيقة)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-gray-900 font-bold"
                  >
                    <option value={15}>15 دقيقة</option>
                    <option value={30}>30 دقيقة</option>
                    <option value={45}>45 دقيقة</option>
                    <option value={60}>60 دقيقة</option>
                    <option value={90}>90 دقيقة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-gray-900 font-bold"
                  >
                    <option value="pending">معلق</option>
                    <option value="confirmed">مؤكد</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">ملاحظات</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات عن الموعد..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-gray-900 font-bold resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border-2 border-gray-400 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  حفظ الموعد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}