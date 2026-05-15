import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { 
  ChevronRight, 
  User, 
  Phone, 
  FileText, 
  AlertCircle, 
  Pill, 
  Camera,
  Save,
  Loader2,
  Users,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    gender: 'male',
    birth_date: '', // ← جديد
    medical_history: '',
    allergies: '',
    current_medications: '',
  });
  const [panoramaImage, setPanoramaImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPanoramaImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const patient = await api.post<any>('/patients', formData);

      if (panoramaImage && patient.id) {
        const uploadData = new FormData();
        uploadData.append('panorama_image', panoramaImage);
        uploadData.append('patient_id', patient.id.toString());
        
        await api.post('/patients/upload-panorama', uploadData, true);
      }

      toast.success('تم إضافة المريض بنجاح!');
      router.push('/patients');
    } catch (err: any) {
      console.error('Submit Error:', err);
      toast.error(err.message || 'فشل في إضافة المريض');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push('/patients')}
          className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center text-slate-600 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800">إضافة مريض جديد</h1>
          <p className="text-slate-400 text-sm mt-1">أدخل بيانات المريض الأساسية</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* البيانات الأساسية */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
              <User size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800">البيانات الأساسية</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* الاسم الكامل */}
            <div className="space-y-2">
              <label className="text-slate-600 font-bold text-sm flex items-center gap-2">
                <User size={16} /> الاسم الكامل *
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="محمد أحمد الخالد"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-cyan-600 font-bold text-slate-700 transition-all"
              />
            </div>

            {/* رقم الهاتف */}
            <div className="space-y-2">
              <label className="text-slate-600 font-bold text-sm flex items-center gap-2">
                <Phone size={16} /> رقم الهاتف *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="09xxxxxxxx"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-cyan-600 font-bold text-slate-700 transition-all"
              />
            </div>

            {/* الجنس */}
            <div className="space-y-2">
              <label className="text-slate-600 font-bold text-sm flex items-center gap-2">
                <Users size={16} /> الجنس *
              </label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-cyan-600 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>

            {/* تاريخ الميلاد ← جديد */}
            <div className="space-y-2">
              <label className="text-slate-600 font-bold text-sm flex items-center gap-2">
                <Calendar size={16} /> تاريخ الميلاد *
              </label>
              <input
                type="date"
                name="birth_date"
                required
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-cyan-600 font-bold text-slate-700 transition-all"
              />
            </div>
          </div>
        </div>

        {/* البيانات الطبية */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
              <AlertCircle size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800">البيانات الطبية</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-slate-600 font-bold text-sm flex items-center gap-2">
                <FileText size={16} /> السوابق المرضية
              </label>
              <textarea
                name="medical_history"
                rows={3}
                value={formData.medical_history}
                onChange={handleChange}
                placeholder="سكري، ضغط، أمراض قلب..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-cyan-600 font-bold text-slate-700 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-600 font-bold text-sm flex items-center gap-2">
                <AlertCircle size={16} /> الحساسية
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="حساسية من البنسلين، اللاتكس..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-cyan-600 font-bold text-slate-700 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-600 font-bold text-sm flex items-center gap-2">
                <Pill size={16} /> الأدوية الحالية
              </label>
              <input
                type="text"
                name="current_medications"
                value={formData.current_medications}
                onChange={handleChange}
                placeholder="أسبرين، أملوديبين..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-cyan-600 font-bold text-slate-700 transition-all"
              />
            </div>
          </div>
        </div>

        {/* صورة البانوراما */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Camera size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800">صورة الأشعة (بانوراما)</h2>
          </div>

          <div 
            className={`relative border-4 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer
              ${previewUrl ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-cyan-300 hover:bg-cyan-50'}`}
            onClick={() => document.getElementById('panorama-input')?.click()}
          >
            <input
              id="panorama-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Panorama preview" 
                className="max-h-64 mx-auto rounded-2xl shadow-lg"
              />
            ) : (
              <div className="space-y-4">
                <Camera size={48} className="mx-auto text-slate-300" />
                <p className="text-slate-400 font-bold">اضغط لرفع صورة البانوراما</p>
                <p className="text-slate-300 text-sm">JPG, PNG - الحد الأقصى 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/patients')}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black transition-all"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-300 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={24} />
                حفظ المريض
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}