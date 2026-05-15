import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getToken } from '../lib/api';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">جاري التوجيه...</p>
      </div>
    </div>
  );
}