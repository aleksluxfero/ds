import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAllUniqueTags } from '@/services/api';
import { Dream, DreamType } from '@/types/dream';
import { ArrowLeftIcon, CheckIcon } from '../icons';
import { Spinner } from '@telegram-apps/telegram-ui';
import { backButton, useRawInitData } from '@telegram-apps/sdk-react';
import { extractTagsFromText } from '../utils';
import { useCreateDreamMutation, useUpdateDreamMutation, useDreamQuery } from '@/hooks/useDreamsQuery';
import DreamTitleInput from '../forms/DreamTitleInput';
import DreamContentInput from '../forms/DreamContentInput';
import DreamTypeSelector from '../forms/DreamTypeSelector';
import DreamTagInput from '../forms/DreamTagInput';
import DreamDateInput from '../forms/DreamDateInput';

const DRAFT_KEY = 'lucidream_draft';

const AddDreamPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const initData = useRawInitData();

  const createMutation = useCreateDreamMutation(initData || '');
  const updateMutation = useUpdateDreamMutation(initData || '');

  const id = params.id as string;
  const dreamId = id ? parseInt(id, 10) : null;
  const isEditMode = dreamId !== null;

  const { data: dreamToEdit, isLoading: isLoadingDream } = useDreamQuery(initData || '', dreamId || 0);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState<DreamType>(DreamType.Normal);
  const [date, setDate] = useState(new Date());
  const [isDateUnknown, setIsDateUnknown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [initialDream, setInitialDream] = useState<Partial<Dream> | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const debounceTimeout = useRef<number | null>(null);
  const tagExtractionDebounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (!initData) return;
    getAllUniqueTags(initData).then(setAllTags).catch(console.error);
  }, [initData]);

  useEffect(() => {
    if (isEditMode && dreamToEdit) {
      setTitle(dreamToEdit.title);
      setContent(dreamToEdit.content);
      setTags(dreamToEdit.tags || []);
      setType(dreamToEdit.type || DreamType.Normal);
      if (dreamToEdit.date) {
        setDate(new Date(Number(dreamToEdit.date)));
        setIsDateUnknown(false);
      } else {
        setIsDateUnknown(true);
      }
      setInitialDream({
        title: dreamToEdit.title,
        content: dreamToEdit.content,
        tags: dreamToEdit.tags || [],
        type: dreamToEdit.type || DreamType.Normal,
        date: dreamToEdit.date,
      });
    } else if (!isEditMode) {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setTitle(draft.title || '');
          setContent(draft.content || '');
          setTags(draft.tags || []);
          setType(draft.type || DreamType.Normal);
          const draftIsDateUnknown = draft.isDateUnknown || false;
          setIsDateUnknown(draftIsDateUnknown);
          setDate(draft.date && !draftIsDateUnknown ? new Date(draft.date) : new Date());
          setInitialDream(draft);
        } catch (e) {
          console.error("Failed to parse draft", e);
          localStorage.removeItem(DRAFT_KEY);
        }
      } else {
        setInitialDream({
          title: '',
          content: '',
          tags: [],
          type: DreamType.Normal,
          date: new Date().getTime(),
        });
      }
    }
  }, [isEditMode, dreamToEdit]);

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

    // Simple JSON string comparison for deep equality (ignoring undefined/null differences if handled)
    // Ideally use lodash.isEqual but this is simple enough for primitives
    const isSame =
      initialDream.title === title &&
      initialDream.content === content &&
      JSON.stringify(initialDream.tags) === JSON.stringify(tags) &&
      initialDream.type === type &&
      (initialDream.date === currentDreamState.date || (initialDream.date === null && currentDreamState.date === null)); // simplified

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
    }, 1000);

    return () => {
      if (tagExtractionDebounceTimeout.current) {
        clearTimeout(tagExtractionDebounceTimeout.current);
      }
    };
  }, [content, allTags]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

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
        await updateMutation.mutateAsync({ id: dreamId, dream: dreamPayload });
      } else {
        await createMutation.mutateAsync(dreamPayload);
        localStorage.removeItem(DRAFT_KEY);
      }
      router.back();
    } catch (err) {
      console.error("Failed to save dream:", err);
      setError('Не удалось сохранить сон. Пожалуйста, попробуйте снова.');
      setIsSaving(false);
    }
  }, [isSaving, title, content, tags, type, date, isDateUnknown, isEditMode, dreamId, router, createMutation, updateMutation]);

  const handleBackClick = useCallback(() => {
    if (isDirty) {
      handleSave();
    } else {
      router.back();
    }
  }, [isDirty, handleSave, router]);

  useEffect(() => {
    backButton.hide();
    return () => { };
  }, []);

  if (isEditMode && isLoadingDream) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="l" />
      </div>
    );
  }

  return (
    <div>
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
          <DreamTitleInput value={title} onChange={setTitle} />
          <DreamContentInput value={content} onChange={setContent} />
          <DreamTypeSelector value={type} onChange={setType} />
          <DreamTagInput tags={tags} setTags={setTags} allTags={allTags} setAllTags={setAllTags} />
          <DreamDateInput date={date} setDate={setDate} isDateUnknown={isDateUnknown} setIsDateUnknown={setIsDateUnknown} />

          {error && <p className="text-red-400 text-sm text-center pt-4">{error}</p>}

        </form>
      </div>
    </div>
  );
};

export default AddDreamPage;