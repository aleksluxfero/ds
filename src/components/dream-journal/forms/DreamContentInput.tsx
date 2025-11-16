import React from 'react';

interface DreamContentInputProps {
  value: string;
  onChange: (value: string) => void;
}

const DreamContentInput: React.FC<DreamContentInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-2">Опишите ваш сон</label>
      <textarea
        id="content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Что произошло в вашем сне? Что вы видели, слышали или чувствовали?"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-none"
      />
    </div>
  );
};

export default React.memo(DreamContentInput);
