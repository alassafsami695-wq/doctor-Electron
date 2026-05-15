import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { authApi, setToken } from '../lib/api';

type AuthMode = 'login' | 'register' | 'verify';

interface InputProps {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
}

function Input({ label, name, type, value, onChange, placeholder, maxLength }: InputProps) {
  return (
    <div>
      <label className="block text-slate-300 text-xs font-medium mb-1.5 mr-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
        required
      />
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');

  // ✅ أزلت password_confirmation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    clinic_address: '',
    code: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authApi.login(formData.email, formData.password);
      setToken(response.access_token);
      router.push(response.role === 'super_admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err: any) {
      if (err.response?.data?.needs_verification) {
        setFormData({ ...formData, email: err.response.data.email });
        setMode('verify');
        setMessage('الرجاء إدخال كود التحقق لتفعيل حسابك');
      } else {
        setError(err.response?.data?.message || 'بيانات الدخول غير صحيحة');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. التسجيل الجديد (بدون password_confirmation)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        // تأكد من أن authApi.register معرفة وتستقبل هذه البيانات
        const response = await authApi.register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            clinic_address: formData.clinic_address,
        });

        // استخدام الاستجابة القادمة من السيرفر
        setMessage(response.message || 'تم التسجيل بنجاح! الرجاء إدخال كود التحقق المرسل لبريدك');
        setMode('verify');
    } catch (err: any) {
        // معالجة الأخطاء القادمة من لارافيل (خطأ 422 أو 500)
        const errorMsg = err.response?.data?.errors 
            ? Object.values(err.response.data.errors).flat().join(', ')
            : (err.response?.data?.message || 'حدث خطأ أثناء التسجيل');
        
        setError(errorMsg);
    } finally {
        setLoading(false);
    }
};

  // 3. التحقق من الكود
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authApi.verifyCode(formData.email, formData.code);
      setToken(response.access_token);
      setMessage('تم تفعيل حسابك بنجاح! جاري التوجيه...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'كود التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  // 4. إعادة إرسال الكود
  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authApi.resendCode(formData.email);
      setMessage(response.message || 'تم إعادة إرسال كود جديد!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل إعادة الإرسال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-right" dir="rtl">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-cyan-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-3">
            🦷
          </div>
          <h1 className="text-2xl font-bold text-white">Oravue</h1>
          <p className="text-slate-400 text-sm">نظام إدارة عيادات الأسنان</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">

          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {mode === 'login' && 'تسجيل الدخول'}
            {mode === 'register' && 'إنشاء حساب طبيب جديد'}
            {mode === 'verify' && 'تأكيد الحساب'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-200 text-sm text-center">
              {message}
            </div>
          )}

          <form 
            onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleVerify} 
            className="space-y-4"
          >

            {mode === 'register' && (
              <>
                <Input 
                  label="الاسم الكامل" 
                  name="name" 
                  type="text" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="د. سامي العساف" 
                />
                <Input 
                  label="رقم الهاتف" 
                  name="phone" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="09XXXXXXXX" 
                />
                <Input 
                  label="عنوان العيادة" 
                  name="clinic_address" 
                  type="text" 
                  value={formData.clinic_address} 
                  onChange={handleChange} 
                  placeholder="دمشق - شارع الحمراء" 
                />
              </>
            )}

            {(mode === 'login' || mode === 'register') && (
              <>
                <Input 
                  label="البريد الإلكتروني" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="example@mail.com" 
                />
                <Input 
                  label="كلمة المرور" 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                />
              </>
            )}

            {/* ✅ أزلت حقل تأكيد كلمة المرور بالكامل */}

            {mode === 'verify' && (
              <>
                <div className="text-center mb-4">
                  <p className="text-slate-400 text-sm">
                    تم إرسال كود التحقق إلى
                  </p>
                  <p className="text-cyan-400 font-semibold">{formData.email}</p>
                </div>
                <Input 
                  label="كود التحقق (6 أرقام)" 
                  name="code" 
                  type="text" 
                  value={formData.code} 
                  onChange={handleChange} 
                  placeholder="123456" 
                  maxLength={6}
                />

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline disabled:opacity-50"
                  >
                    لم يصل الكود؟ إعادة الإرسال
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري المعالجة...
                </span>
              ) : (
                mode === 'login' ? 'دخول' : 
                mode === 'register' ? 'إنشاء الحساب' : 
                'تفعيل الحساب'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm space-y-2">
            {mode === 'login' ? (
              <p className="text-slate-400">
                ليس لديك حساب؟{' '}
                <button 
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setMessage('');
                  }} 
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  سجل عيادتك الآن
                </button>
              </p>
            ) : (
              <button 
                onClick={() => {
                  setMode('login');
                  setError('');
                  setMessage('');
                }} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                العودة لتسجيل الدخول
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 Oravue - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}