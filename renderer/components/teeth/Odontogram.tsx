import React, { useState } from 'react';

// FDI tooth numbering system (split into quadrants for better layout)
const UPPER_TEETH_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_TEETH_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_TEETH_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

// Tooth shape SVG paths for different tooth types
const TOOTH_SHAPES = {
  molar: `M 4,4 C 1,4 0,7 0,11 L 0,24 C 0,29 3,31 8,31 L 12,31 C 17,31 20,29 20,24 L 20,11 C 20,7 18,4 15,4 Z M 2,11 L 18,11 L 18,24 C 18,26 15,28 12,28 L 8,28 C 5,28 2,26 2,24 Z`,
  premolar: `M 5,5 C 2,5 1,8 1,12 L 1,23 C 1,27 4,30 8,30 L 12,30 C 16,30 19,27 19,23 L 19,12 C 19,8 17,5 14,5 Z`,
  canine: `M 8,2 C 5,2 3,5 3,9 L 4,25 C 4,29 7,32 10,32 C 13,32 16,29 16,25 L 17,9 C 17,5 15,2 12,2 Z`,
  incisor: `M 7,3 C 4,3 2,6 2,10 L 3,26 C 3,30 6,33 10,33 C 14,33 17,30 17,26 L 18,10 C 18,6 16,3 13,3 Z`,
};

// Determine tooth shape based on FDI number
const getToothShape = (num: number): keyof typeof TOOTH_SHAPES => {
  const n = num % 10;
  if (n === 1 || n === 2) return 'incisor';
  if (n === 3) return 'canine';
  if (n === 4 || n === 5) return 'premolar';
  return 'molar';
};

// Status colors and labels
export const STATUS_COLORS = {
  healthy: { fill: '#10b981', stroke: '#059669', label: 'سليم' },
  caries: { fill: '#ef4444', stroke: '#dc2626', label: 'تسوس' },
  filled: { fill: '#3b82f6', stroke: '#2563eb', label: 'حشوة' },
  missing: { fill: '#cbd5e1', stroke: '#94a3b8', label: 'مفقود' },
  crown: { fill: '#f59e0b', stroke: '#d97706', label: 'تاج' },
  root_canal: { fill: '#8b5cf6', stroke: '#7c3aed', label: 'علاج جذر' },
  extracted: { fill: '#64748b', stroke: '#475569', label: 'مخلع' },
  implant: { fill: '#06b6d4', stroke: '#0891b2', label: 'زراعة' },
  cleaning: { fill: '#14b8a6', stroke: '#0d9488', label: 'تنظيف' },
  ortho: { fill: '#ec4899', stroke: '#db2777', label: 'تقويم' },
  other: { fill: '#6b7280', stroke: '#4b5563', label: 'أخرى' },
};

export type ToothStatus = keyof typeof STATUS_COLORS;

// Interface for teeth data
export interface TeethData {
  [toothNumber: number]: {
    status?: ToothStatus;
    hasHistory?: boolean;
    [key: string]: any;
  };
}

// Interface for component props
export interface OdontogramProps {
  onToothSelect?: (toothNumber: number) => void;
  selectedTooth?: number | null;
  teethData?: TeethData;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLE TOOTH SVG COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ToothSVGProps {
  number: number;
  status: ToothStatus;
  isSelected: boolean;
  onClick: (number: number) => void;
  hasHistory: boolean;
}

const ToothSVG: React.FC<ToothSVGProps> = ({ number, status, isSelected, onClick, hasHistory }) => {
  const shape = getToothShape(number);
  const color = STATUS_COLORS[status] || STATUS_COLORS.healthy;

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110 z-10' : 'hover:scale-105'}`}
      onClick={() => onClick(number)}
      title={`سن ${number} - ${color.label}`}
    >
      <svg width="44" height="52" viewBox="0 0 20 36" className="drop-shadow-sm">
        {/* Main tooth shape */}
        <path
          d={TOOTH_SHAPES[shape]}
          fill={color.fill}
          stroke={isSelected ? '#0e7490' : color.stroke}
          strokeWidth={isSelected ? "1.5" : "0.8"}
          opacity={status === 'missing' ? 0.35 : 1}
        />

        {/* Root canal indicator lines */}
        {status === 'root_canal' && (
          <>
            <line x1="6" y1="20" x2="6" y2="34" stroke="white" strokeWidth="1.2" opacity="0.8" />
            <line x1="10" y1="20" x2="10" y2="34" stroke="white" strokeWidth="1.2" opacity="0.8" />
            <line x1="14" y1="20" x2="14" y2="34" stroke="white" strokeWidth="1.2" opacity="0.8" />
          </>
        )}

        {/* Extracted X mark */}
        {status === 'extracted' && (
          <>
            <line x1="3" y1="7" x2="17" y2="29" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="17" y1="7" x2="3" y2="29" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}

        {/* Crown indicator (white cap on top) */}
        {status === 'crown' && (
          <rect x="1" y="3" width="18" height="7" rx="3" fill="white" opacity="0.7" stroke="white" strokeWidth="0.5" />
        )}

        {/* Implant indicator (screw line) */}
        {status === 'implant' && (
          <>
            <line x1="8" y1="25" x2="8" y2="34" stroke="white" strokeWidth="1.5" opacity="0.8" />
            <line x1="6" y1="28" x2="10" y2="28" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="6" y1="31" x2="10" y2="31" stroke="white" strokeWidth="1" opacity="0.6" />
          </>
        )}
      </svg>

      {/* Tooth number label */}
      <div 
        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-black ${isSelected ? 'text-cyan-700' : 'text-slate-500'}`}
      >
        {number}
      </div>

      {/* History indicator dot */}
      {hasHistory && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white shadow-md animate-pulse" />
      )}

      {/* Selected state border */}
      {isSelected && (
        <div className="absolute -inset-1.5 border-2 border-cyan-500 rounded-xl pointer-events-none bg-cyan-500/5" />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ODONTOGRAM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Odontogram: React.FC<OdontogramProps> = ({ 
  onToothSelect, 
  selectedTooth = null, 
  teethData = {}
}) => {
  const handleToothClick = (number: number) => {
    if (onToothSelect) {
      onToothSelect(number);
    }
  };

  const getToothStatus = (number: number): ToothStatus => {
    return teethData[number]?.status || 'healthy';
  };

  const hasHistory = (number: number): boolean => {
    return teethData[number]?.hasHistory || false;
  };

  const renderToothRow = (teeth: number[]) => (
    <div className="flex justify-center items-end gap-1 sm:gap-1.5 md:gap-2">
      {teeth.map((num) => (
        <ToothSVG
          key={num}
          number={num}
          status={getToothStatus(num)}
          isSelected={selectedTooth === num}
          onClick={handleToothClick}
          hasHistory={hasHistory(num)}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full" dir="rtl">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 mb-5">
        {Object.entries(STATUS_COLORS).map(([key, value]) => (
          <div 
            key={key} 
            className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full shadow-sm border border-slate-100"
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: value.fill, border: `1.5px solid ${value.stroke}` }}
            />
            <span className="text-[11px] font-bold text-slate-600">{value.label}</span>
          </div>
        ))}
      </div>

      {/* Odontogram Container */}
      <div className="bg-white rounded-[2.5rem] shadow-lg border border-slate-100 p-5 sm:p-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-50 rounded-full -translate-x-20 -translate-y-20 opacity-40" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-50 rounded-full translate-x-16 translate-y-16 opacity-40" />

        {/* Upper Jaw */}
        <div className="relative z-10 mb-1">
          <h3 className="text-center text-xs font-black text-slate-400 mb-3 tracking-widest uppercase">
            الفك العلوي (Upper)
          </h3>
          <div className="flex justify-center gap-3 sm:gap-6 md:gap-10">
            {/* Right side */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 mb-1 font-bold">يمين</span>
              {renderToothRow(UPPER_TEETH_RIGHT)}
            </div>
            {/* Left side */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 mb-1 font-bold">يسار</span>
              {renderToothRow(UPPER_TEETH_LEFT)}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="border-b-2 border-dashed border-slate-200" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">خط الفصل</span>
          </div>
        </div>

        {/* Lower Jaw */}
        <div className="relative z-10 mt-1">
          <div className="flex justify-center gap-3 sm:gap-6 md:gap-10">
            {/* Right side */}
            <div className="flex flex-col items-center">
              {renderToothRow(LOWER_TEETH_RIGHT)}
              <span className="text-[10px] text-slate-400 mt-1 font-bold">يمين</span>
            </div>
            {/* Left side */}
            <div className="flex flex-col items-center">
              {renderToothRow(LOWER_TEETH_LEFT)}
              <span className="text-[10px] text-slate-400 mt-1 font-bold">يسار</span>
            </div>
          </div>
          <h3 className="text-center text-xs font-black text-slate-400 mt-3 tracking-widest uppercase">
            الفك السفلي (Lower)
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Odontogram;