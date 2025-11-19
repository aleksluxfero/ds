import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getAllDreams, getDreamById, addDream, updateDream, deleteDream } from '@/services/api';
import { Dream } from '@/types/dream';

// Helper to fetch stats
const getDreamStats = async (initData: string, params: { startDate?: string; endDate?: string; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.type) queryParams.append('type', params.type);

    const response = await fetch(`/api/stats?${queryParams.toString()}`, {
        headers: {
            'X-Telegram-Auth': initData,
        }
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json().then(data => data.stats);
};

export const useDreamStatsQuery = (initData: string, startDate: Date, endDate: Date, type: string) => {
    return useQuery({
        queryKey: ['dreamStats', startDate.toISOString(), endDate.toISOString(), type],
        queryFn: () => getDreamStats(initData, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            type
        }),
        enabled: !!initData,
    });
};


export const useDreamsQuery = (initData: string, search?: string, type?: string) => {
    return useInfiniteQuery({
        queryKey: ['dreams', search, type],
        queryFn: async ({ pageParam = 0 }) => {
            const limit = 20;
            const dreams = await getAllDreams(initData, { limit, offset: pageParam, search, type });
            return { dreams, nextOffset: dreams.length === limit ? pageParam + limit : undefined };
        },
        getNextPageParam: (lastPage) => lastPage.nextOffset,
        initialPageParam: 0,
        enabled: !!initData,
    });
};

export const useDreamQuery = (initData: string, id: number) => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['dream', id],
        queryFn: () => getDreamById(initData, id),
        enabled: !!initData && !!id,
        initialData: () => {
            const allDreamsCache = queryClient.getQueryData<{ pages: { dreams: Dream[] }[] }>(['dreams']);
            if (allDreamsCache) {
                for (const page of allDreamsCache.pages) {
                    const found = page.dreams.find(d => d.id === id);
                    if (found) return found;
                }
            }
            return undefined;
        }
    });
};

export const useCreateDreamMutation = (initData: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dream: Omit<Dream, 'id'>) => addDream(initData, dream),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dreams'] });
        },
    });
};

export const useUpdateDreamMutation = (initData: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dream }: { id: number; dream: Partial<Dream> }) => updateDream(initData, id, dream),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['dreams'] });
            queryClient.invalidateQueries({ queryKey: ['dream', variables.id] });
        },
    });
};

export const useDeleteDreamMutation = (initData: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteDream(initData, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dreams'] });
        },
    });
};
