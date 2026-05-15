import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';  
import { 
  User, Loader2, ArrowRight, Activity, Pill, AlertTriangle, FileText, 
  Upload, Image as ImageIcon, History, CheckCircle2, Maximize2, Coins 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Odontogram from '../../components/teeth/Odontogram'; 

export default function PatientProfile() {
  const router = useRouter();
  const { id } = router.query;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingMedical, setSavingMedical] = useState(false);
  const [savingProcedure, setSavingProcedure] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [treatmentForm, setTreatmentForm] = useState({
    procedure_id: '',
    final_price: '',
    paid_now: '',
    currency: 'USD' as 'USD' | 'SYP',
    doctor_notes: '',
  });

  const [medicalInfo, setMedicalInfo] = useState({
    medical_history: '',
    allergies: '',
    current_medications: ''
  });

  const [teethData, setTeethData] = useState<Record<number, any>>({});

  const proceduresList = [
    { id: 1, label: 'خلع', slug: 'extracted' },
    { id: 2, label: 'زراعة', slug: 'implant' },
    { id: 3, label: 'حشوة', slug: 'filling' },
    { id: 4, label: 'سحب عصب', slug: 'root-canal' },
    { id: 5, label: 'تاج (تلبيسة)', slug: 'crown' },
    { id: 8, label: 'تنظيف', slug: 'cleaning' },
    { id: 9, label: 'تقويم', slug: 'ortho' },
    { id: 10, label: 'فحص/أخرى', slug: 'other' },
  ];

  useEffect(() => {
    if (id) fetchPatientData();
  }, [id]);

  useEffect(() => {
    if (patient?.dental_charts_summary) {
      const data: Record<number, any> = {};
      Object.entries(patient.dental_charts_summary).forEach(([toothNum, info]: [string, any]) => {
        data[Number(toothNum)] = {
          status: info.status || info.procedure_slug || 'healthy',
          hasHistory: true,
          ...info
        };
      });
      setTeethData(data);
    }
  }, [patient]);

  const fetchPatientData = async () => {
  try {
    const response = await api.get<any>(`/patients/${id}`);
    const data = response.data || response; // ← هذا هو المفتاح
    
    console.log('Patient data:', data); // تأكد في Console
    
    setPatient(data);
    setMedicalInfo({
      medical_history: data.medical_history || '',
      allergies: data.allergies || '',
      current_medications: data.current_medications || ''
    });
  } catch (err) {
    toast.error("خطأ في تحميل بيانات المريض");
  } finally {
    setLoading(false);
  }
  };

  const handleUpdateMedical = async () => {
    setSavingMedical(true);
    try {
      await api.post(`/patients/${id}/medical-info`, medicalInfo);
      toast.success("تم تحديث السجل الطبي");
      fetchPatientData();
    } catch (err) {
      toast.error("فشل تحديث البيانات");
    } finally {
      setSavingMedical(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('panorama_image', file);
    formData.append('patient_id', id.toString());
    try {
      await api.post(`/patients/upload-panorama`, formData, true);
      toast.success("تم رفع الصورة");
      fetchPatientData();
    } catch (err) {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToothSelect = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
    setTreatmentForm({
      procedure_id: '',
      final_price: '',
      paid_now: '',
      currency: 'USD',
      doctor_notes: '',
    });
    setShowTreatmentModal(true);
  };

  const handleSaveTreatment = async () => {
    if (!selectedTooth || !treatmentForm.procedure_id) {
      toast.error("حدد السن ونوع المعالجة");
      return;
    }
    setSavingProcedure(true);
    try {
      const proc = proceduresList.find(p => p.id === Number(treatmentForm.procedure_id));
      await api.post('/dental-charts', {
        patient_id: id,
        tooth_number: selectedTooth,
        procedure_id: Number(treatmentForm.procedure_id),
        doctor_notes: treatmentForm.doctor_notes,
        final_price: Number(treatmentForm.final_price) || 0,
        paid_now: Number(treatmentForm.paid_now) || 0,
        currency: treatmentForm.currency,
        status: proc?.slug || 'other'
      });
      toast.success("تم تسجيل المعالجة");
      setShowTreatmentModal(false);
      setSelectedTooth(null);
      setTreatmentForm({
        procedure_id: '',
        final_price: '',
        paid_now: '',
        currency: 'USD',
        doctor_notes: '',
      });
      fetchPatientData();
    } catch (err) {
      toast.error("خطأ أثناء الحفظ");
    } finally {
      setSavingProcedure(false);
    }
  };

  const getTeethDataFromHistory = () => {
    const data = { ...teethData };
    if (patient?.dental_history) {
      patient.dental_history.forEach((item: any) => {
        if (!data[item.tooth_number]) {
          data[item.tooth_number] = {
            status: item.procedure_slug || 'healthy',
            hasHistory: true
          };
        }
      });
    }
    return data;
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen gap-4 bg-slate-50">
      <Loader2 className="animate-spin text-cyan-600" size={50} />
      <p className="font-black text-slate-600 italic text-center">Oravue: جاري تحميل ملف المريض...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 text-right pb-20 px-6 pt-6" dir="rtl">

      {/* Header & Balances */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-[1.8rem] flex items-center justify-center text-white shadow-lg">
            <User size={38} />
          </div>
          <div>
            <h1 className="font-black text-3xl text-gray-900 tracking-tight">{patient?.full_name}</h1>
            <p className="text-gray-700 font-bold flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              {patient?.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem]">
          <div className={`px-6 py-3 rounded-2xl bg-white border flex flex-col items-center min-w-[140px] shadow-sm ${Number(patient?.balances?.USD) < 0 ? 'border-red-200' : 'border-emerald-200'}`}>
            <span className={`text-[10px] font-black uppercase ${Number(patient?.balances?.USD) < 0 ? 'text-red-600' : 'text-emerald-700'}`}>رصيد الدولار</span>
            <span className={`text-2xl font-black ${Number(patient?.balances?.USD) < 0 ? 'text-red-700' : 'text-emerald-800'}`} dir="ltr">
              {Number(patient?.balances?.USD).toLocaleString()} $
            </span>
          </div>
          <div className={`px-6 py-3 rounded-2xl bg-white border flex flex-col items-center min-w-[140px] shadow-sm ${Number(patient?.balances?.SYP) < 0 ? 'border-red-200' : 'border-emerald-200'}`}>
            <span className={`text-[10px] font-black uppercase ${Number(patient?.balances?.SYP) < 0 ? 'text-red-600' : 'text-emerald-700'}`}>رصيد الليرة</span>
            <span className={`text-2xl font-black ${Number(patient?.balances?.SYP) < 0 ? 'text-red-700' : 'text-emerald-800'}`} dir="ltr">
              {Number(patient?.balances?.SYP).toLocaleString()} ل.س
            </span>
          </div>
          <button onClick={() => router.push('/patient')} className="p-4 text-gray-600 hover:text-cyan-600 transition-all">
            <ArrowRight size={32} />
          </button>
        </div>
      </div>

      {/* Panorama and odontogram stacked */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-2 rounded-[3.5rem] shadow-xl border border-slate-200 overflow-hidden group">
          <div className="relative h-[420px] w-full bg-slate-900 rounded-[3rem] flex items-center justify-center overflow-hidden">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            {patient?.panorama_image ? (
              <>
                <img src={patient.panorama_image} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt="Panorama" />
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <button onClick={() => fileInputRef.current?.click()} className="bg-white/90 p-3 rounded-xl shadow-xl text-cyan-600"><Upload size={20}/></button>
                  <button onClick={() => window.open(patient.panorama_image, '_blank')} className="bg-cyan-600 text-white p-3 rounded-xl shadow-xl"><Maximize2 size={20}/></button>
                </div>
              </>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 font-bold flex flex-col items-center gap-4">
                <ImageIcon size={48} /> رفع الصورة البانورامية
              </button>
            )}
            {uploadingImage && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold"><Loader2 className="animate-spin mr-2"/> جاري الرفع...</div>}
          </div>

          <div className="w-full bg-slate-50/50 p-6 rounded-[2.5rem] mt-8">
            <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-gray-900 w-full">
              <Activity className="text-cyan-600" /> مخطط الأسنان
            </h3>
            <Odontogram 
              onToothSelect={handleToothSelect}
              selectedTooth={selectedTooth}
              teethData={getTeethDataFromHistory()}
            />
          </div>
        </div>
      </div>

      {/* Medical Info Section */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-xl flex items-center gap-2 text-gray-900"><FileText className="text-cyan-600" /> السجل الصحي</h3>
          <button onClick={handleUpdateMedical} disabled={savingMedical} className="bg-cyan-50 text-cyan-700 px-6 py-2 rounded-2xl font-bold flex items-center gap-2">
            {savingMedical ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle2 size={18}/>} حفظ التعديلات
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200">
            <label className="text-xs font-black text-gray-800 flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-gray-600"/> التاريخ الطبي والحساسية</label>
            <textarea value={medicalInfo.medical_history} onChange={e => setMedicalInfo({...medicalInfo, medical_history: e.target.value})} className="w-full bg-transparent font-bold text-gray-900 outline-none h-24 resize-none"/>
          </div>
          <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-200">
            <label className="text-xs font-black text-emerald-800 flex items-center gap-2 mb-2"><Pill size={16}/> الأدوية الحالية</label>
            <textarea value={medicalInfo.current_medications} onChange={e => setMedicalInfo({...medicalInfo, current_medications: e.target.value})} className="w-full bg-transparent font-bold text-gray-900 outline-none h-24 resize-none"/>
          </div>
        </div>
      </div>

      {/* Treatment Modal */}
      {showTreatmentModal && selectedTooth && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <Activity size={24} />
                    معالجة جديدة
                  </h2>
                  <p className="text-cyan-100 mt-1 text-sm font-bold">سن #{selectedTooth}</p>
                </div>
                <button 
                  onClick={() => { setShowTreatmentModal(false); setSelectedTooth(null); }}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-2xl font-bold">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Patient Info */}
              {patient && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <User size={18} className="text-cyan-700" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{patient.full_name}</p>
                    <p className="text-xs text-gray-600 font-medium">{patient.phone}</p>
                  </div>
                </div>
              )}

              {/* Procedure Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">نوع المعالجة</label>
                <select
                  value={treatmentForm.procedure_id}
                  onChange={(e) => {
                    const proc = proceduresList.find(p => p.id === Number(e.target.value)) as any;
                    setTreatmentForm({
                      ...treatmentForm,
                      procedure_id: e.target.value,
                      final_price: proc?.default_price?.toString() || '',
                    });
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-bold text-gray-900"
                >
                  <option value="">اختر نوع المعالجة...</option>
                  {proceduresList.map((proc) => (
                    <option key={proc.id} value={proc.id}>
                      {proc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">المبلغ الإجمالي</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-bold">
                      {treatmentForm.currency === 'SYP' ? 'ل.س' : '$'}
                    </span>
                    <input
                      type="number"
                      value={treatmentForm.final_price}
                      onChange={(e) => setTreatmentForm({ ...treatmentForm, final_price: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-bold text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">المدفوع الآن</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-bold">
                      {treatmentForm.currency === 'SYP' ? 'ل.س' : '$'}
                    </span>
                    <input
                      type="number"
                      value={treatmentForm.paid_now}
                      onChange={(e) => setTreatmentForm({ ...treatmentForm, paid_now: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-bold text-cyan-700"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">العملة</label>
                <div className="flex gap-3">
                  {(['USD', 'SYP'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setTreatmentForm({ ...treatmentForm, currency: curr })}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        treatmentForm.currency === curr
                          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200'
                          : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                      }`}
                    >
                      {curr === 'SYP' ? 'ل.س' : '$'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">ملاحظات الطبيب</label>
                <textarea
                  value={treatmentForm.doctor_notes}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, doctor_notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-bold text-gray-900 resize-none"
                  placeholder="وصف الحالة والمعالجة..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowTreatmentModal(false); setSelectedTooth(null); }}
                  className="flex-1 py-3.5 border-2 border-slate-300 text-gray-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveTreatment}
                  disabled={savingProcedure}
                  className="flex-1 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingProcedure ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle2 size={18} />}
                  حفظ المعالجة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Feed */}
      <div className="bg-slate-900 text-white p-12 rounded-[4rem]">
        <h4 className="font-black text-2xl flex items-center gap-4 mb-10 text-cyan-400"><History size={32}/> السجل الطبي والمالي</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patient?.dental_history?.map((item: any) => (
            <div key={item.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <div className="flex justify-between mb-4">
                <span className="bg-cyan-600 px-3 py-1 rounded-lg text-xs font-black">سن #{item.tooth_number}</span>
                <span className="text-xs text-gray-400 font-bold">{item.created_at}</span>
              </div>
              <p className="font-black text-lg mb-2 text-white">{item.procedure_name}</p>
              <p className="text-gray-300 text-sm italic line-clamp-2 mb-4">"{item.doctor_notes || 'لا ملاحظات'}"</p>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-xs text-gray-400 uppercase font-black">المتبقي:</span>
                <span className={`font-black ${item.final_price - item.paid_now > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {(item.final_price - item.paid_now).toLocaleString()} {item.currency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}