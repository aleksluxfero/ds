import React from 'react';
import { DreamType } from '@/types/dream';

const typeOptions = [
  { type: DreamType.Normal, label: 'Обычный' },
  { type: DreamType.Lucid, label: 'Осознанный' },
  { type: DreamType.Vivid, label: 'Яркий' },
  { type: DreamType.FalseAwakening, label: 'Ложное пробуждение' },
  { type: DreamType.SleepParalysis, label: 'Сонный паралич' },
];

const typeButtonStyles: Record<string, string> = {
  [DreamType.Normal]: 'bg-gray-600 border-gray-500 text-white',
  [DreamType.Lucid]: 'bg-cyan-600 border-cyan-500 text-white',
  [DreamType.Vivid]: 'bg-yellow-600 border-yellow-500 text-white',
  [DreamType.FalseAwakening]: 'bg-purple-600 border-purple-500 text-white',
  [DreamType.SleepParalysis]: 'bg-red-800 border-red-700 text-white',
};

interface DreamTypeSelectorProps {
  value: DreamType;
  onChange: (value: DreamType) => void;
}

const DreamTypeSelector: React.FC<DreamTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-3">Тип сна</label>
      <div className="flex flex-wrap gap-2">
        {typeOptions.map(option => (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border-2 transition-all
              ${value === option.type
                ? `${typeButtonStyles[option.type]} scale-105`
                : 'bg-white/5 border-transparent hover:border-white/20'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(DreamTypeSelector);
