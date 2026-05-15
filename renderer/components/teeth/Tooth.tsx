'use client';

import React from 'react';
import { getStatusColor, ToothStatus } from './status';

interface ToothProps {
  id: number;
  isSelected: boolean;
  onClick: (id: number) => void;
  status?: ToothStatus | string | { status?: ToothStatus | string };
}

const Tooth: React.FC<ToothProps> = ({ id, isSelected, onClick, status }) => {
  const toothStatus = typeof status === 'object' ? status.status || 'healthy' : status || 'healthy';
  const color = getStatusColor(toothStatus as ToothStatus);

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      title={`سن ${id} - ${color.label}`}
      className={`relative flex items-center justify-center w-14 h-14 rounded-3xl border-2 transition-all duration-300 shadow-sm ${
        isSelected ? 'scale-110 shadow-xl' : 'hover:-translate-y-0.5'
      }`}
      style={{
        backgroundColor: color.fill,
        borderColor: color.stroke,
        color: '#0f172a',
      }}
    >
      <span className="text-[11px] font-black">{id}</span>
      {isSelected && (
        <span className="absolute -top-2 right-0 rounded-full bg-blue-600 text-white text-[10px] px-1 py-0.5">+</span>
      )}
    </button>
  );
};

export default Tooth;
