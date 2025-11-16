import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDreamById } from '@/services/api';
import { Dream } from '@/types/dream';
import { ArrowLeftIcon, EditIcon, Trash2Icon, CopyIcon } from '../icons';
import ConfirmationDialog from '../ConfirmationDialog';
import Toast from '../Toast';
import LoadingSpinner from '../LoadingSpinner';
import { getDreamTypeLabel, getDreamTypeStyles } from '../utils';
import { useDreams } from '@/contexts/DreamContext';
import { useAuth } from '@/contexts/AuthContext';

type ToastType = 'success' | 'error';
interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

const DreamDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { initDataRaw } = useAuth();
  const { state, deleteDream } = useDreams();
  const { dreams, loading: dreamsLoading } = state;

  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toastState, setToastState] = useState<ToastState>({ visible: false, message: '', type: 'success' });

  const dreamId = useMemo(() => {
    const id = params.id as string;
    return id ? Number(id) : null;
  }, [params.id]);

  useEffect(() => {
    if (!dreamId) {
      router.push('/');
      return;
    }

    // Сначала ищем сон в контексте
    const dreamFromContext = dreams.find(d => d.id === dreamId);

    if (dreamFromContext) {
      setDream(dreamFromContext);
      setLoading(false);
    } else if (!dreamsLoading && initDataRaw) {
      // Если в контексте снов нет и загрузка завершена, делаем fetch
      const fetchDream = async () => {
        setLoading(true);
        try {
          const dreamData = await getDreamById(initDataRaw, dreamId);
          setDream(dreamData || null);
        } catch (error) {
          console.error("Failed to fetch dream:", error);
          setDream(null);
        } finally {
          setLoading(false);
        }
      };
      fetchDream();
    }
  }, [dreamId, dreams, dreamsLoading, router, initDataRaw]);

  useEffect(() => {
    if (toastState.visible) {
      const timer = setTimeout(() => {
        setToastState(prev => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastState.visible]);


  const handleConfirmDelete = async () => {
    if (dream) {
      try {
        await deleteDream(dream.id);
        router.push('/');
      } catch (error) {
        setToastState({ visible: true, message: 'Ошибка при удалении сна.', type: 'error' });
      }
    }
  };

  const handleTagClick = (tag: string) => {
    // Simplified navigation, as search state is no longer passed
    router.push('/');
  };
  
  const formattedDate = dream?.date
    ? new Date(Number(dream.date)).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Дата неизвестна';

  const handleCopy = async () => {
    if (!dream) return;
  
    const dreamTypeText = getDreamTypeLabel(dream.type);
    const tagsText = dream.tags.length > 0 ? `Теги: #${dream.tags.join(' #')}` : '';
  
    const dateLine = `📅 Дата: ${formattedDate}`;

    const formattedText = `
${dream.title || 'Без названия'}
--------------------
${dateLine}
🏷️ Тип: ${dreamTypeText}

${dream.content}

${tagsText ? `--------------------
${tagsText}` : ''}
    `.trim().replace(/^\s+/gm, '');
  
    try {
      await navigator.clipboard.writeText(formattedText);
      setToastState({ visible: true, message: 'Сон скопирован!', type: 'success' });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setToastState({ visible: true, message: 'Не удалось скопировать.', type: 'error' });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Загрузка сна..." />;
  }

  if (!dream) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-200 py-20 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Сон не найден</h2>
            <p className="text-gray-400 mb-8">Возможно, он был удален или никогда не существовал.</p>
            <button 
            onClick={() => router.push('/')} 
            className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
            Вернуться на главную
            </button>
        </div>
      </div>
    );
  }

  const styles = getDreamTypeStyles(dream.type);

  return (
    <div>
      <header className="sticky top-0 z-20 h-16 bg-black/30 backdrop-blur-lg border-b border-white/10 flex items-center">
        <div className="container mx-auto px-4 max-w-3xl flex justify-between items-center">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
            <span>На главную</span>
            </button>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={handleCopy}
                    className="p-2 rounded-full text-gray-400 hover:bg-green-500/20 hover:text-green-400 transition-colors"
                    aria-label="Скопировать сон"
                >
                    <CopyIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => router.push(`/edit/${dream.id}`)}
                    className="p-2 rounded-full text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                    aria-label="Редактировать сон"
                >
                    <EditIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setShowConfirm(true)}
                    className="p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    aria-label="Удалить сон"
                >
                    <Trash2Icon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pb-8 md:pb-12 pt-8 max-w-3xl">
        <article className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8">
            <div className="relative mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-100 break-words pr-24">{dream.title || "Без названия"}</h1>
                <div className={`absolute top-0 right-0 text-xs font-semibold px-2 py-1 rounded-md flex-shrink-0 ${styles.badge}`}>
                    {getDreamTypeLabel(dream.type)}
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-400 text-sm mb-6">
                <span>{formattedDate}</span>
            </div>

            {(dream.tags?.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {(dream.tags || []).map(tag => (
                        <button 
                            key={tag} 
                            onClick={() => handleTagClick(tag)}
                            className="bg-indigo-500/20 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-indigo-500/40 hover:text-indigo-200 transition-colors break-all"
                            aria-label={`Найти сны с тегом ${tag}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            <div className="prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed max-w-none">
                <p style={{ whiteSpace: 'pre-wrap' }}>{dream.content}</p>
            </div>
        </article>
      </div>

      {showConfirm && (
        <ConfirmationDialog 
          message="Вы уверены, что хотите удалить этот сон? Это действие нельзя отменить."
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      <Toast 
          message={toastState.message} 
          type={toastState.type}
          visible={toastState.visible} 
        />
    </div>
  );
};

export default DreamDetailPage;