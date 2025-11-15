import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Dream, DreamType } from '@/types/dream';
import { getAllDreams, deleteDream } from '@/services/api';
import DreamCard from '../DreamCard';
import ConfirmationDialog from '../ConfirmationDialog';
import Toast from '../Toast';
import { PlusIcon, BookOpenTextIcon, SettingsIcon, SearchIcon, XIcon, BarChartIcon } from '../icons';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/components/Link/Link';
import LoadingSpinner from '../LoadingSpinner'; // Keep this import for other loading states

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="text-center py-10 flex flex-col items-center">
    <BookOpenTextIcon className="w-24 h-24 text-purple-400/50 mb-6" />
    <h2 className="text-2xl font-bold text-gray-200 mb-2">Ваш дневник снов пуст</h2>
    <p className="text-gray-400 max-w-md mx-auto mb-8">Полотно вашего подсознания ждет. Начните, записав свое первое ночное приключение.</p>
    <button
      onClick={onAdd}
      className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
    >
      Записать первый сон
    </button>
  </div>
);

type ToastType = 'loading' | 'success' | 'error';
interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}
type FilterType = DreamType | 'all';

const filterOptions: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: DreamType.Normal, label: 'Обычные' },
  { key: DreamType.Lucid, label: 'Осознанные' },
  { key: DreamType.Vivid, label: 'Яркие' },
  { key: DreamType.FalseAwakening, label: 'Ложные пробуждения' },
  { key: DreamType.SleepParalysis, label: 'Сонный паралич' },
];

const activeFilterStyles: Record<string, string> = {
    'all': 'bg-purple-600 text-white shadow-md',
    [DreamType.Normal]: 'bg-gradient-to-r from-purple-600/40 to-indigo-600/40 text-white shadow-md',
    [DreamType.Lucid]: 'bg-gradient-to-r from-cyan-400/50 to-blue-500/50 text-white shadow-md',
    [DreamType.Vivid]: 'bg-gradient-to-r from-yellow-400/50 to-orange-500/50 text-white shadow-md',
    [DreamType.FalseAwakening]: 'bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white shadow-md',
    [DreamType.SleepParalysis]: 'bg-gradient-to-r from-red-700/50 to-gray-800/50 text-white shadow-md',
};


const HomePage: React.FC = () => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastState, setToastState] = useState<ToastState>({ visible: false, message: '', type: 'loading' });
  const [filterType, setFilterType] = useState<FilterType>('all');

  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Keep for potential future import/export
  const router = useRouter();
  const { initDataRaw } = useAuth();

  const loadDreams = useCallback(async (showLoader = true) => {
    if (!initDataRaw) return;
    try {
      if (showLoader) {
        setLoading(true);
      }
      const dreamsFromDB = await getAllDreams(initDataRaw);
      setDreams(dreamsFromDB);
    } catch (error) {
      console.error("Failed to load dreams:", error);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [initDataRaw]);

  useEffect(() => {
    if (initDataRaw) {
        loadDreams();
    }
  }, [initDataRaw, loadDreams]);

  useEffect(() => {
    const handleSilentReload = () => loadDreams(false);
    window.addEventListener('focus', handleSilentReload);
    return () => {
      window.removeEventListener('focus', handleSilentReload);
    };
  }, [loadDreams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
            setIsSettingsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (toastState.visible && (toastState.type === 'success' || toastState.type === 'error')) {
      const timer = setTimeout(() => {
        setToastState(prev => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastState]);

  const filteredDreams = useMemo(() => {
    return dreams
      .filter(dream => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          dream.title.toLowerCase().includes(query) ||
          dream.content.toLowerCase().includes(query) ||
          dream.tags.some(tag => tag.toLowerCase().includes(query))
        );
      })
      .filter(dream => {
        if (filterType === 'all') return true;
        
        const dreamType = dream.type || DreamType.Normal;
        return dreamType === filterType;
      });
  }, [dreams, searchQuery, filterType]);
  
  // Removed WelcomeDialog related code

  // Removed Export/Import related code (commented out)
  // const handleExport = async () => { ... };
  // const handleImportClick = () => { ... };
  // const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => { ... };

  const handleDeleteRequest = useCallback((id: number) => {
    setShowConfirm(id);
  }, []);

  const handleEditRequest = useCallback((id: number) => {
    router.push(`/edit/${id}`);
  }, [router]);

  const handleViewRequest = useCallback((id: number) => {
    router.push(`/dream/${id}`);
  }, [router]);

  const handleConfirmDelete = async () => {
    if (showConfirm !== null && initDataRaw) {
      await deleteDream(initDataRaw, showConfirm);
      setShowConfirm(null);
      await loadDreams();
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(null);
  };
  
  const isImporting = false; // toastState.type === 'loading' && toastState.visible; // Simplified as import/export is commented out

  return (
    <div className="animate-fade-in">
      <header className="sticky top-0 z-20 h-16 bg-black/30 backdrop-blur-lg border-b border-white/10 flex items-center">
        <div className="container mx-auto px-4 max-w-3xl flex justify-between items-center transition-all duration-300">
            {!isSearchOpen ? (
                <>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                Дневник Снов
                </h1>
                <div className="flex items-center gap-2">
                    {dreams.length > 0 && (
                        <button 
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                            aria-label="Поиск"
                        >
                            <SearchIcon className="w-6 h-6" />
                        </button>
                    )}
                    <div className="relative" ref={settingsMenuRef}>
                        <button 
                            onClick={() => setIsSettingsOpen(prev => !prev)}
                            className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                            aria-label="Настройки"
                        >
                            <SettingsIcon className="w-6 h-6" />
                        </button>
                        {isSettingsOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a182e] border border-purple-500/20 rounded-lg shadow-2xl z-30 p-2 animate-fade-in-fast">
                                <Link href="/stats" className="w-full flex items-center gap-3 text_sm px-3 py-2 rounded-md text-gray-300 hover:bg-white/10 transition-colors">
                                    <BarChartIcon className="w-4 h-4" />
                                    Статистика
                                </Link>
                                {/* Export/Import buttons commented out */}
                            </div>
                        )}
                    </div>
                </div>
                </>
            ) : (
                <div className="w-full flex items-center gap-2 animate-fade-in-fast">
                    <div className="relative flex-grow">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Поиск по снам..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 pl-10 text-gray-100 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    </div>
                    <button 
                        onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        }}
                        className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                        aria-label="Закрыть поиск"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
      </header>
      
      {!loading && dreams.length > 0 && (
        <div className="container mx-auto px-4 max-w-3xl pt-6">
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map(option => (
              <button
                key={option.key}
                onClick={() => setFilterType(option.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterType === option.key
                    ? activeFilterStyles[option.key]
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-8 md:pb-12 pt-6 max-w-3xl">
        {loading && <LoadingSpinner text="Загрузка снов..." />}
        
        {!loading && dreams.length === 0 && (
          <EmptyState onAdd={() => router.push('/add')} />
        )}

        {!loading && filteredDreams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDreams.map(dream => (
              <DreamCard key={dream.id} dream={dream} onDelete={handleDeleteRequest} onEdit={handleEditRequest} onView={handleViewRequest} />
            ))}
          </div>
        )}
        
        {!loading && dreams.length > 0 && filteredDreams.length === 0 && (
          <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-300">Ничего не найдено</h3>
              <p className="text-gray-500 mt-2">Попробуйте изменить поисковый запрос или фильтр.</p>
          </div>
        )}
      </div>

      <button
        onClick={() => router.push('/add')}
        className="fixed bottom-8 right-8 bg-purple-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-purple-600/40 hover:bg-purple-700 transition-all duration-300 transform hover:scale-110 z-20"
        aria-label="Добавить новый сон"
      >
        <PlusIcon className="w-7 h-7" />
      </button>
      
      {showConfirm !== null && (
        <ConfirmationDialog 
          message="Вы уверены, что хотите удалить этот сон? Это действие нельзя отменить."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          confirmText="Удалить"
        />
      )}
      <input
        type="file"
        ref={fileInputRef}
        // onChange={handleFileSelected}
        accept=".json,application/json"
        style={{ display: 'none' }}
        aria-hidden="true"
      />
       <Toast 
          message={toastState.message} 
          type={toastState.type}
          visible={toastState.visible} 
        />
    </div>
  );
};

export default HomePage;