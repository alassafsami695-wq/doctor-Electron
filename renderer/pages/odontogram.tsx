import React, { useState } from 'react';
import Head from 'next/head';
import Odontogram from '../components/teeth/Odontogram';

export default function OdontogramPage() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const handleToothSelect = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
    console.log('Selected tooth:', toothNumber);
  };

  return (
    <>
      <Head>
        <title>Odontogram | Dental Clinic</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            خريطة الأسنان (Odontogram)
          </h1>

          <Odontogram 
            onToothSelect={handleToothSelect}
            selectedTooth={selectedTooth}
          />

          {selectedTooth && (
            <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
              <p className="text-slate-600">
                السن المحدد: <span className="font-bold text-cyan-600">{selectedTooth}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}