import React from 'react';
import { CheckIcon } from '../icons';

const formatDateForInput = (d: Date): string => {
    if (!d || isNaN(d.getTime())) {
      d = new Date();
    }
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface DreamDateInputProps {
  date: Date;
  setDate: (date: Date) => void;
  isDateUnknown: boolean;
  setIsDateUnknown: (isUnknown: boolean) => void;
}

const DreamDateInput: React.FC<DreamDateInputProps> = ({ date, setDate, isDateUnknown, setIsDateUnknown }) => {
  return (
    <div>
      <label htmlFor="dream-date" className="block text-sm font-medium text-gray-400 mb-2">Дата и время сна</label>
      <input
        type="datetime-local"
        id="dream-date"
        value={isDateUnknown ? '' : formatDateForInput(date)}
        onChange={(e) => {
          if (e.target.value) {
            let selectedDate = new Date(e.target.value);
            const now = new Date();
            if (selectedDate > now) {
              selectedDate = now;
            }
            setDate(selectedDate);
          }
        }}
        max={formatDateForInput(new Date())}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ colorScheme: 'dark' }}
        disabled={isDateUnknown}
      />
      <div className="mt-3">
        <label htmlFor="date-unknown" className="flex items-center cursor-pointer group">
          <input
            id="date-unknown"
            type="checkbox"
            checked={isDateUnknown}
            onChange={(e) => setIsDateUnknown(e.target.checked)}
            className="sr-only peer"
          />
          <div className="
            w-5 h-5 rounded-md border-2 border-gray-500 bg-white/5 
            flex items-center justify-center flex-shrink-0
            transition-all duration-200
            group-hover:border-purple-400
            peer-checked:bg-purple-600 peer-checked:border-purple-500
          ">
            <CheckIcon className="
              w-3.5 h-3.5 text-white 
              opacity-0 peer-checked:opacity-100
              transition-opacity duration-200
            " />
          </div>
          <span className="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors">
            Я не помню точную дату
          </span>
        </label>
      </div>
    </div>
  );
};

export default React.memo(DreamDateInput);
