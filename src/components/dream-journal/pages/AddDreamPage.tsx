import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { addDream, getDreamById, updateDream, getAllUniqueTags } from '@/services/api';
import { Dream, DreamType } from '@/types/dream';
import { ArrowLeftIcon, XIcon, CheckIcon } from '../icons';
import { Spinner, BackButton } from '@telegram-apps/telegram-ui';
import { extractTagsFromText } from '../utils';
import { useAuth } from '@/contexts/AuthContext';

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

const DRAFT_KEY = 'lucidream_draft';

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


const AddDreamPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { initDataRaw } = useAuth();

  const id = params.id as string;
  const dreamId = id ? parseInt(id, 10) : null;
  const isEditMode = dreamId !== null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState<DreamType>(DreamType.Normal);
  const [date, setDate] = useState(new Date());
  const [isDateUnknown, setIsDateUnknown] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [isTagInputFocused, setIsTagInputFocused] = useState(false);
  const [initialDream, setInitialDream] = useState<Partial<Dream> | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  const debounceTimeout = useRef<number | null>(null);
  const tagExtractionDebounceTimeout = useRef<number | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagInputBlurTimeout = useRef<number | null>(null);


  useEffect(() => {
    if (!initDataRaw) return;

    const initialize = async () => {
      getAllUniqueTags(initDataRaw).then(setAllTags).catch(console.error);

      let dreamData: Partial<Dream> = {
        title: '',
        content: '',
        tags: [],
        type: DreamType.Normal,
        date: new Date().getTime(),
      };

      if (isEditMode && dreamId) {
        const dreamToEdit = await getDreamById(initDataRaw, dreamId);
        if (dreamToEdit) {
          dreamData = {
            title: dreamToEdit.title,
            content: dreamToEdit.content,
            tags: dreamToEdit.tags || [],
            type: dreamToEdit.type || DreamType.Normal,
            date: dreamToEdit.date,
          };
          setTitle(dreamToEdit.title);
          setContent(dreamToEdit.content);
          setTags(dreamToEdit.tags || []);
          setType(dreamToEdit.type || DreamType.Normal);
          if (dreamToEdit.date) {
            setDate(new Date(dreamToEdit.date));
            setIsDateUnknown(false);
          } else {
            setIsDateUnknown(true);
          }
        } else {
          router.push('/'); // Dream not found, redirect to home
          return;
        }
      } else {
        // Load draft from localStorage only when creating a new dream
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          try {
            const draft = JSON.parse(savedDraft);
            dreamData = {
              title: draft.title || '',
              content: draft.content || '',
              tags: draft.tags || [],
              type: draft.type || DreamType.Normal,
              date: draft.date,
            };
            setTitle(draft.title || '');
            setContent(draft.content || '');
            setTags(draft.tags || []);
            setType(draft.type || DreamType.Normal);
            const draftIsDateUnknown = draft.isDateUnknown || false;
            setIsDateUnknown(draftIsDateUnknown);
            setDate(draft.date && !draftIsDateUnknown ? new Date(draft.date) : new Date());
          } catch (e) {
            console.error("Failed to parse draft", e);
            localStorage.removeItem(DRAFT_KEY);
          }
        }
      }
      setInitialDream(dreamData);
    };
    initialize();
  }, [isEditMode, dreamId, router, initDataRaw]);

  // Check if form is dirty
  useEffect(() => {
    if (!initialDream) return;

    const currentDreamState = {
      title,
      content,
      tags,
      type,
      date: isDateUnknown ? null : date.getTime(),
    };

    // Simple JSON string comparison for deep equality
    const isSame = JSON.stringify(initialDream) === JSON.stringify(currentDreamState);
    setIsDirty(!isSame);
  }, [title, content, tags, type, date, isDateUnknown, initialDream]);
  
  // Save draft to localStorage with debounce (only in add mode)
  useEffect(() => {
    if (isEditMode) return;

    if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = window.setTimeout(() => {
        const draft = { title, content, tags, type, date: date.getTime(), isDateUnknown };
        if (title.trim() || content.trim() || tags.length > 0) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } else {
            localStorage.removeItem(DRAFT_KEY);
        }
    }, 500);

    return () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    };
  }, [title, content, tags, type, date, isEditMode, isDateUnknown]);

  // Auto-extract tags from content with debounce
  useEffect(() => {
    if (content.trim() === '' || allTags.length === 0) {
      return;
    }

    if (tagExtractionDebounceTimeout.current) {
      clearTimeout(tagExtractionDebounceTimeout.current);
    }

    tagExtractionDebounceTimeout.current = window.setTimeout(() => {
      const newTags = extractTagsFromText(content, allTags);
      if (newTags.length > 0) {
        setTags(prevTags => {
          const combined = new Set([...prevTags, ...newTags]);
          return Array.from(combined);
        });
      }
    }, 1000); // Debounce for 1 second after user stops typing

    return () => {
      if (tagExtractionDebounceTimeout.current) {
        clearTimeout(tagExtractionDebounceTimeout.current);
      }
    };
  }, [content, allTags]);
  
  const handleSave = useCallback(async () => {
    if (isSaving || !initDataRaw) return;

    if (!title.trim() && !content.trim() && tags.length === 0) {
      if (!isEditMode) {
        localStorage.removeItem(DRAFT_KEY);
      }
      router.back();
      return;
    }
    
    setError('');
    setIsSaving(true);
    
    try {
      const dreamPayload = {
        title,
        content,
        tags,
        type,
        date: isDateUnknown ? null : date.getTime(),
      };

      if (isEditMode && dreamId) {
        await updateDream(initDataRaw, dreamId, dreamPayload);
      } else {
        await addDream(initDataRaw, dreamPayload);
        localStorage.removeItem(DRAFT_KEY);
      }
      router.back();
    } catch (err) {
      console.error("Failed to save dream:", err);
      setError('Не удалось сохранить сон. Пожалуйста, попробуйте снова.');
      setIsSaving(false);
    }
  }, [isSaving, title, content, tags, type, date, isDateUnknown, isEditMode, dreamId, router, initDataRaw]);

  const handleBackClick = useCallback(() => {
    if (isDirty) {
      handleSave();
    } else {
      router.back();
    }
  }, [isDirty, handleSave, router]);

  const handleAddTag = (tag: string) => {
    const cleanedTag = tag.trim().toLowerCase();
    if (cleanedTag && !tags.includes(cleanedTag)) {
      setTags(prevTags => [...prevTags, cleanedTag]);
      if (!allTags.includes(cleanedTag)) {
        setAllTags(prevAllTags => [...prevAllTags, cleanedTag].sort());
      }
    }
    setCurrentTag('');
    setTagSuggestions([]);
    tagInputRef.current?.focus();
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      handleAddTag(currentTag.trim());
    }
  };

  const handleCurrentTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (/[ ,]/.test(inputValue)) {
        const newTags = inputValue.split(/[ ,]+/).filter(tag => tag.trim() !== '');
        if (newTags.length > 0) {
            newTags.forEach(tag => handleAddTag(tag));
        }
        setCurrentTag('');
    } else {
        setCurrentTag(inputValue);
        if (inputValue.trim() === '') {
            setTagSuggestions([]);
            return;
        }
        const filteredSuggestions = allTags
            .filter(tag => 
                tag.toLowerCase().includes(inputValue.toLowerCase().trim()) && 
                !tags.includes(tag)
            )
            .slice(0, 5);
        setTagSuggestions(filteredSuggestions);
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleTypeChange = (selectedType: DreamType) => {
    setType(selectedType);
  };

  const handleTagInputFocus = () => {
    if (tagInputBlurTimeout.current) {
        clearTimeout(tagInputBlurTimeout.current);
    }
    setIsTagInputFocused(true);
  };

  const handleTagInputBlur = () => {
    tagInputBlurTimeout.current = window.setTimeout(() => {
        setIsTagInputFocused(false);
    }, 200);
  };

  return (
    <div className="animate-fade-in">
      <BackButton onClick={handleBackClick} />
      <header className="sticky top-0 z-20 h-16 bg-black/30 backdrop-blur-lg border-b border-white/10 flex items-center">
        <div className="container mx-auto px-4 max-w-3xl flex justify-between items-center">
            <div className="flex items-center gap-4">
            <button onClick={handleBackClick} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Назад">
                <ArrowLeftIcon className="w-6 h-6 text-gray-300" />
            </button>
            <h1 className="text-lg font-bold text-gray-100">{isEditMode ? 'Редактировать' : 'Новый сон'}</h1>
            </div>
            <div className="flex items-center gap-2">
                <button 
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 rounded-full text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Сохранить"
                >
                {isSaving ? (
                    <Spinner size="s" className="text-purple-500" />
                ) : (
                    <CheckIcon className="w-6 h-6" />
                )}
                </button>
            </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-8 md:pb-12 pt-8 max-w-3xl">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">Заголовок сна</label>
            <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например, Полет над неоновым городом"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            />
            </div>

            <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-2">Опишите ваш сон</label>
            <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Что произошло в вашем сне? Что вы видели, слышали или чувствовали?"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-none"
            />
            </div>
            
            <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Тип сна</label>
            <div className="flex flex-wrap gap-2">
                {typeOptions.map(option => (
                <button
                    key={option.type}
                    type="button"
                    onClick={() => handleTypeChange(option.type)}
                    className={`
                    px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border-2 transition-all
                    ${type === option.type
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

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-400 mb-2">Теги (через пробел, Enter или запятую)</label>
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-purple-500/50 text-purple-100 text-xs font-medium pl-2.5 pr-1 py-1 rounded-full break-all">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-purple-200 hover:text-white rounded-full">
                        <XIcon className="w-3.5 h-3.5" />
                        </button>
                    </span>
                    ))}
                    <input
                      ref={tagInputRef}
                      type="text"
                      id="tags"
                      value={currentTag}
                      onChange={handleCurrentTagChange}
                      onKeyDown={handleTagInputKeyDown}
                      onFocus={handleTagInputFocus}
                      onBlur={handleTagInputBlur}
                      placeholder="добавить тег..."
                      className="bg-transparent flex-grow outline-none text-gray-100 placeholder-gray-500 min-w-[100px] py-1"
                      autoComplete="off"
                    />
                </div>
                {isTagInputFocused && tagSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a182e] border border-purple-500/20 rounded-lg shadow-2xl z-10 overflow-hidden animate-fade-in-fast">
                      <ul role="listbox">
                          {tagSuggestions.map(suggestion => (
                              <li key={suggestion}>
                                  <button
                                      type="button"
                                      onClick={() => handleAddTag(suggestion)}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                                      role="option"
                                      aria-selected="false"
                                  >
                                      {suggestion}
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>
                )}
              </div>
            </div>

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
            
            {error && <p className="text-red-400 text-sm text-center pt-4">{error}</p>}

        </form>
      </div>
    </div>
  );
};

export default AddDreamPage;
