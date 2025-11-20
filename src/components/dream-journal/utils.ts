import { DreamType } from '@/types/dream';

const lucidStyles = {
  container: 'p-px bg-gradient-to-br from-cyan-400/50 to-blue-500/50',
  card: 'border-transparent bg-[#1a182e] backdrop-blur-none',
  badge: 'bg-cyan-500/30 text-cyan-200',
  divider: 'bg-gradient-to-r from-cyan-400/50 to-blue-500/50',
  descriptionColor: 'text-gray-200',
  dateColor: 'text-gray-300',
  iconColor: 'text-gray-300'
};

const faStyles = {
  container: 'p-px bg-gradient-to-br from-purple-500/50 to-pink-500/50',
  card: 'border-transparent bg-[#1a182e] backdrop-blur-none',
  badge: 'bg-purple-500/30 text-purple-200',
  divider: 'bg-gradient-to-r from-purple-500/50 to-pink-500/50',
  descriptionColor: 'text-gray-200',
  dateColor: 'text-gray-300',
  iconColor: 'text-gray-300'
};

const spStyles = {
  container: 'p-px bg-gradient-to-br from-red-700/50 to-gray-800/50',
  card: 'border-transparent bg-[#1a182e] backdrop-blur-none',
  badge: 'bg-red-700/40 text-red-200',
  divider: 'bg-gradient-to-r from-red-700/50 to-gray-800/50',
  descriptionColor: 'text-gray-200',
  dateColor: 'text-gray-300',
  iconColor: 'text-gray-300'
};

const vividStyles = {
  container: 'p-px bg-gradient-to-br from-yellow-400/50 to-orange-500/50',
  card: 'border-transparent bg-[#1a182e] backdrop-blur-none',
  badge: 'bg-yellow-500/30 text-yellow-200',
  divider: 'bg-gradient-to-r from-yellow-400/50 to-orange-500/50',
  descriptionColor: 'text-gray-200',
  dateColor: 'text-gray-300',
  iconColor: 'text-gray-300'
};

const normalStyles = {
  container: 'p-px bg-gradient-to-br from-purple-600/40 to-indigo-600/40',
  card: 'border-transparent bg-[#1a182e] backdrop-blur-none',
  badge: 'bg-white/10 text-gray-300',
  divider: 'bg-gradient-to-r from-purple-600/40 to-indigo-600/40',
  descriptionColor: 'text-gray-300',
  dateColor: 'text-gray-300',
  iconColor: 'text-gray-300'
};

export const getDreamTypeStyles = (type: DreamType = DreamType.Normal) => {
  switch (type) {
    case DreamType.SleepParalysis:
      return spStyles;
    case DreamType.Lucid:
      return lucidStyles;
    case DreamType.FalseAwakening:
      return faStyles;
    case DreamType.Vivid:
      return vividStyles;
    case DreamType.Normal:
    default:
      return normalStyles;
  }
};

export const getDreamTypeLabel = (type: DreamType = DreamType.Normal) => {
  switch (type) {
    case DreamType.Normal:
      return 'Обычный';
    case DreamType.Lucid:
      return 'Осознанный';
    case DreamType.FalseAwakening:
      return 'Ложное пробуждение';
    case DreamType.SleepParalysis:
      return 'Сонный паралич';
    case DreamType.Vivid:
      return 'Яркий';
    default:
      return 'Обычный';
  }
};

export const getShortDreamTypeLabel = (type: DreamType = DreamType.Normal) => {
  switch (type) {
    case DreamType.FalseAwakening:
      return 'ЛП';
    default:
      return getDreamTypeLabel(type);
  }
};


export const extractTagsFromText = (text: string, existingTags: string[]): string[] => {
  if (!text || !existingTags || existingTags.length === 0) {
    return [];
  }

  // 1. Очистить и разделить текст на уникальные слова
  const words = new Set(
    text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // убрать пунктуацию
      .split(/\s+/) // разделить по пробелам
      .filter(w => w.length > 2) // игнорировать очень короткие слова
  );

  const foundTags = new Set<string>();

  // 2. Сравнить каждый существующий тег с каждым словом из текста
  for (const tag of existingTags) {
    for (const word of words) {
      // 3. Простая проверка на склонения: одна строка является префиксом другой
      if (word.startsWith(tag) || tag.startsWith(word)) {
        // 4. Эвристика для избежания ложных срабатываний (например, 'кот' в 'котлета')
        // Предполагаем, что правильные формы слов не слишком сильно отличаются по длине.
        if (Math.abs(word.length - tag.length) < 4) {
          foundTags.add(tag);
          break; // Матч для этого тега найден, переходим к следующему
        }
      }
    }
  }

  return Array.from(foundTags);
};