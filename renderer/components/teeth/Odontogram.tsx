'use client';
import React, { useState } from 'react';
import Tooth from './Tooth';

interface OdontogramProps {
    onToothSelect: (num: number) => void;
    selectedTooth: number | null;
    teethData?: any;
}

export default function Odontogram({ onToothSelect, selectedTooth, teethData }: OdontogramProps) {
    const [view, setView] = useState<'permanent' | 'deciduous'>('permanent');

    const permanentUpper = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
    const permanentLower = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
    const deciduousUpper = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
    const deciduousLower = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

    const renderArch = (teethArray: number[], isUpper: boolean) => {
        const archWidth = 850;
        const archHeight = 150;
        const midPoint = (teethArray.length - 1) / 2;

        return (
            <div className="relative mx-auto" style={{ width: `${archWidth}px`, height: `${archHeight}px` }}>
                {teethArray.map((num, index) => {
                    const distanceFromCenter = index - midPoint;
                    const xPos = (index / (teethArray.length - 1)) * archWidth;
                    const curveY = Math.pow(Math.abs(distanceFromCenter), 2) * 2.2;

                    return (
                        <div key={num} className="absolute transition-all duration-500"
                            style={{
                                left: `${xPos}px`,
                                top: isUpper ? `${curveY}px` : 'auto',
                                bottom: !isUpper ? `${curveY}px` : 'auto',
                            }}
                        >
                            <Tooth
                                id={num}
                                isSelected={selectedTooth === num}
                                onClick={(id) => onToothSelect(id)}
                                status={teethData?.[num]}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 w-full select-none" dir="ltr">
            <div className="flex justify-center gap-4">
                <button onClick={() => setView('permanent')}
                    className={`px-8 py-3 rounded-2xl font-black text-xs border-2 transition-all ${view === 'permanent' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}>
                    الأسنان الدائمة
                </button>
                <button onClick={() => setView('deciduous')}
                    className={`px-8 py-3 rounded-2xl font-black text-xs border-2 transition-all ${view === 'deciduous' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}>
                    الأسنان اللبنية
                </button>
            </div>

            <div className="bg-white/40 p-16 rounded-[4rem] border-2 border-dashed border-slate-200 overflow-x-auto shadow-sm">
                <div className="min-w-[900px]">
                    <div className="relative mb-24">
                        <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-[0.3em] mb-8">Upper Arch</p>
                        {renderArch(view === 'permanent' ? permanentUpper : deciduousUpper, true)}
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50"></div>
                    <div className="relative mt-24">
                        {renderArch(view === 'permanent' ? permanentLower : deciduousLower, false)}
                        <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-[0.3em] mt-8">Lower Arch</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
