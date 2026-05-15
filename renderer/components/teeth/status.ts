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

export const getStatusColor = (status?: ToothStatus | string) => {
  if (!status || typeof status !== 'string') return STATUS_COLORS.healthy;
  return STATUS_COLORS[status as ToothStatus] || STATUS_COLORS.healthy;
};
