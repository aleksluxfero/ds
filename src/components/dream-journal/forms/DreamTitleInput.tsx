import React from 'react';

interface DreamTitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

const DreamTitleInput: React.FC<DreamTitleInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">Заголовок сна</label>
      <input
        type="text"
        id="title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Например, Полет над неоновым городом"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
      />
    </div>
  );
};

export default React.memo(DreamTitleInput);
