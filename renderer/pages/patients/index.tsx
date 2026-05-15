import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { Users, Plus, Search, User, Phone, ChevronLeft, Loader2, HeartPulse } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get<any>('/patients');
      
      // Laravel Resource يرجع { data: [...] } أو المصفوفة مباشرة
      const data = Array.isArray(response) ? response : response.data || [];
      
      console.log('Patients response:', response);
      setPatients(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("فشل في جلب قائمة المرضى - تأكد من تشغيل الـ Backend");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p: any) =>
    (p.full_name?.toLowerCase().includes(search.toLowerCase())) ||
    (p.phone?.includes(search))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-right p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-cyan-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-cyan-100">
            <Users size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">إدارة المرضى</h1>
            <p className="text-slate-400 font-bold text-sm mt-1">إجمالي المرضى: {patients.length}</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/patients/new')}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-lg active:scale-95"
        >
          <Plus size={24} /> إضافة مريض جديد
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={22} />
        <input
          type="text"
          placeholder="ابحث عن مريض بالاسم أو رقم الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-6 pr-16 bg-white border-2 border-slate-100 rounded-[2rem] outline-none focus:border-cyan-600 font-bold text-slate-700 shadow-sm transition-all text-lg"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-cyan-600" size={48} />
          <p className="text-slate-400 font-black italic">جاري تحميل البيانات...</p>
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient: any) => (
            <div key={patient.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-cyan-200 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <User size={24} />
                </div>
              </div>
              <div className="space-y-1 mb-6">
                <h3 className="text-xl font-black text-slate-800 group-hover:text-cyan-600 transition-colors truncate">{patient.full_name}</h3>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  <Phone size={14} /> {patient.phone}
                </div>
              </div>
              <button 
                onClick={() => router.push(`/patients/${patient.id}`)}
                className="w-full bg-slate-50 group-hover:bg-cyan-50 text-slate-600 group-hover:text-cyan-700 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all"
              >
                فتح الملف الطبي
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-50">
          <HeartPulse size={48} className="mx-auto mb-6 text-slate-200" />
          <h2 className="text-2xl font-black text-slate-400">لا يوجد نتائج</h2>
        </div>
      )}
    </div>
  );
}