import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Dream, DreamType } from '@/types/dream';
import { getAllDreams } from '@/services/api';
import { ArrowLeftIcon, BarChartIcon } from '../icons';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

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

// Robustly format a Date object into a 'YYYY-MM-DD' string for the input.
// This prevents crashes from invalid dates and avoids timezone conversion issues.
const formatDateForInput = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
        date = new Date(); // Fallback to today if date is invalid
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const StatisticsPage: React.FC = () => {
    const [allDreams, setAllDreams] = useState<Dream[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { initDataRaw } = useAuth();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [startDate, setStartDate] = useState<Date>(thirtyDaysAgo);
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [filterType, setFilterType] = useState<FilterType>('all');

    useEffect(() => {
        if (!initDataRaw) return;

        const loadDreams = async () => {
            try {
                setLoading(true);
                const dreamsFromDB = await getAllDreams(initDataRaw);
                setAllDreams(dreamsFromDB);
            } catch (error) {
                console.error("Failed to load dreams for stats:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDreams();
    }, [initDataRaw]);

    const handleDateChange = (
        type: 'start' | 'end',
        value: string
    ) => {
        if (!value) return;
    
        const [year, month, day] = value.split('-').map(Number);
        // Use UTC to avoid timezone issues when only date is concerned
        let selectedDate = new Date(Date.UTC(year, month - 1, day));
    
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
    
        if (selectedDate > today) {
            selectedDate = new Date();
            selectedDate.setUTCHours(0,0,0,0);
        }
    
        if (type === 'start') {
            setStartDate(selectedDate);
            // If the new start date is after the current end date, update the end date
            if (selectedDate > endDate) {
                setEndDate(selectedDate);
            }
        } else { // type === 'end'
            setEndDate(selectedDate);
            // If the new end date is before the current start date, update the start date
            if (selectedDate < startDate) {
                setStartDate(selectedDate);
            }
        }
    };

    const filteredDreams = useMemo(() => {
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        return allDreams
            .filter(dream => {
                if (!dream.date) {
                    return false;
                }
                const dreamDate = new Date(Number(dream.date));
                return dreamDate >= startOfDay && dreamDate <= endOfDay;
            })
            .filter(dream => {
                if (filterType === 'all') return true;
                const dreamType = dream.type || DreamType.Normal;
                return dreamType === filterType;
            });
    }, [allDreams, startDate, endDate, filterType]);

    const stats = useMemo(() => {
        const total = filteredDreams.length;
        const normalCount = filteredDreams.filter(d => (d.type || DreamType.Normal) === DreamType.Normal).length;
        const lucidCount = filteredDreams.filter(d => d.type === DreamType.Lucid).length;
        const vividCount = filteredDreams.filter(d => d.type === DreamType.Vivid).length;
        const faCount = filteredDreams.filter(d => d.type === DreamType.FalseAwakening).length;
        const spCount = filteredDreams.filter(d => d.type === DreamType.SleepParalysis).length;
        const tagCounts = new Map<string, number>();

        filteredDreams.forEach(dream => {
            dream.tags.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        });

        const sortedTags = Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => ({ tag, count }));

        return {
            total,
            normalCount,
            lucidCount,
            vividCount,
            faCount,
            spCount,
            tagStats: sortedTags
        };
    }, [filteredDreams]);

    return (
        <div className="animate-fade-in">
            <header className="sticky top-0 z-20 h-16 bg-black/30 backdrop-blur-lg border-b border-white/10 flex items-center">
                <div className="container mx-auto px-4 max-w-3xl flex justify-between items-center">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                        <ArrowLeftIcon className="w-6 h-6" />
                        <span>На главную</span>
                    </button>
                    <h1 className="text-lg font-bold text-gray-100">Статистика</h1>
                </div>
            </header>

            <div className="container mx-auto px-4 pb-8 md:pb-12 pt-8 max-w-3xl">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-200 mb-4">Фильтры</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-400 mb-2">От</label>
                            <input
                                type="date"
                                id="start-date"
                                value={formatDateForInput(startDate)}
                                onChange={(e) => handleDateChange('start', e.target.value)}
                                max={formatDateForInput(endDate)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-100 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-400 mb-2">До</label>
                            <input
                                type="date"
                                id="end-date"
                                value={formatDateForInput(endDate)}
                                onChange={(e) => handleDateChange('end', e.target.value)}
                                min={formatDateForInput(startDate)}
                                max={formatDateForInput(new Date())}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-100 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                    </div>
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

                {loading ? (
                    <LoadingSpinner text="Загрузка статистики..." />
                ) : filteredDreams.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
                        <BarChartIcon className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300">Сны не найдены</h3>
                        <p className="text-gray-500 mt-2">За выбранный период нет записей, соответствующих фильтрам.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center"><div className="text-3xl font-bold text-gray-200">{stats.total}</div><div className="text-sm text-gray-400 mt-1">Всего снов</div></div>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center"><div className="text-3xl font-bold text-purple-400">{stats.normalCount}</div><div className="text-sm text-gray-400 mt-1">Обычных</div></div>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center"><div className="text-3xl font-bold text-cyan-400">{stats.lucidCount}</div><div className="text-sm text-gray-400 mt-1">Осознанных</div></div>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center"><div className="text-3xl font-bold text-yellow-400">{stats.vividCount}</div><div className="text-sm text-gray-400 mt-1">Ярких</div></div>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center"><div className="text-3xl font-bold text-pink-400">{stats.faCount}</div><div className="text-sm text-gray-400 mt-1">Ложных пробуждений</div></div>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center"><div className="text-3xl font-bold text-red-500">{stats.spCount}</div><div className="text-sm text-gray-400 mt-1">Сонных параличей</div></div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-200 mb-4">Самые частые теги</h2>
                            {stats.tagStats.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.tagStats.map(({ tag, count }, index) => (
                                        <div key={tag} className="bg-white/5 p-3 rounded-lg border border-white/10">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium text-gray-200 break-all min-w-0 pr-2">{tag}</span>
                                                <span className="text-sm text-gray-400 flex-shrink-0">{count} {count > 1 && count < 5 ? 'раза' : 'раз'}</span>
                                            </div>
                                            <div className="w-full bg-black/20 rounded-full h-1.5">
                                                <div 
                                                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full"
                                                    style={{ width: `${(count / (stats.tagStats[0]?.count || 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-6">Теги не найдены в отфильтрованных снах.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StatisticsPage;
