'use client';

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { Dream } from '@/types/dream';
import { addDream, updateDream, deleteDream } from '@/services/api';
import { useAuth } from './AuthContext';

// 1. Определяем состояние и действия
interface DreamState {
  dreams: Dream[];
  loading: boolean;
  error: string | null;
}

type DreamAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Dream[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_DREAM'; payload: Dream }
  | { type: 'UPDATE_DREAM'; payload: Dream }
  | { type: 'DELETE_DREAM'; payload: number };

// 2. Создаем редьюсер
const dreamReducer = (state: DreamState, action: DreamAction): DreamState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, dreams: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_DREAM':
      return { ...state, dreams: [action.payload, ...state.dreams] };
    case 'UPDATE_DREAM':
      return {
        ...state,
        dreams: state.dreams.map(dream =>
          dream.id === action.payload.id ? action.payload : dream
        ),
      };
    case 'DELETE_DREAM':
      return {
        ...state,
        dreams: state.dreams.filter(dream => dream.id !== action.payload),
      };
    default:
      return state;
  }
};

// 3. Создаем контекст
interface DreamContextType {
  state: DreamState;
  dispatch: React.Dispatch<DreamAction>;
  // Добавляем обертки для API-вызовов для удобства
  addDream: (dream: Omit<Dream, 'id'>) => Promise<void>;
  updateDream: (id: number, dream: Partial<Omit<Dream, 'id'>>) => Promise<void>;
  deleteDream: (id: number) => Promise<void>;
}

const DreamContext = createContext<DreamContextType | undefined>(undefined);

// 4. Создаем провайдер
export const DreamProvider = ({ children, initialDreams }: { children: ReactNode, initialDreams: Dream[] }) => {
  const { initDataRaw } = useAuth();
  const initialState: DreamState = {
    dreams: initialDreams,
    loading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(dreamReducer, initialState);

  // Обертки для API-вызовов с оптимистичными обновлениями
  const handleAddDream = async (dream: Omit<Dream, 'id'>) => {
    if (!initDataRaw) throw new Error("Not authenticated");

    const tempId = -Date.now();
    const tempDream: Dream = {
      ...dream,
      id: tempId,
      created_at: new Date(), // Add created_at for sorting
    };

    dispatch({ type: 'ADD_DREAM', payload: tempDream });

    try {
      const newDream = await addDream(initDataRaw, dream);
      // Заменяем временный сон на настоящий
      dispatch({ type: 'DELETE_DREAM', payload: tempId });
      dispatch({ type: 'ADD_DREAM', payload: newDream });
    } catch (error) {
      // Если ошибка, откатываем добавление
      dispatch({ type: 'DELETE_DREAM', payload: tempId });
      console.error("Failed to add dream:", error);
      throw error;
    }
  };

  const handleUpdateDream = async (id: number, dream: Partial<Omit<Dream, 'id'>>) => {
    if (!initDataRaw) throw new Error("Not authenticated");
    
    const originalDreams = state.dreams;
    const originalDream = originalDreams.find(d => d.id === id);
    if (!originalDream) return;

    const updatedOptimisticDream = { ...originalDream, ...dream, id };
    dispatch({ type: 'UPDATE_DREAM', payload: updatedOptimisticDream });

    try {
      await updateDream(initDataRaw, id, dream);
    } catch (error) {
      // Если ошибка, откатываем изменение
      dispatch({ type: 'UPDATE_DREAM', payload: originalDream });
      console.error("Failed to update dream:", error);
      throw error;
    }
  };

  const handleDeleteDream = async (id: number) => {
    if (!initDataRaw) throw new Error("Not authenticated");
    const originalDreams = state.dreams;
    // Оптимистичное удаление
    dispatch({ type: 'DELETE_DREAM', payload: id });
    try {
      await deleteDream(initDataRaw, id);
    } catch (error) {
      // Если ошибка, откатываем изменение
      dispatch({ type: 'FETCH_SUCCESS', payload: originalDreams });
      console.error("Failed to delete dream:", error);
      throw error;
    }
  };

  return (
    <DreamContext.Provider value={{ state, dispatch, addDream: handleAddDream, updateDream: handleUpdateDream, deleteDream: handleDeleteDream }}>
      {children}
    </DreamContext.Provider>
  );
};

// 5. Создаем хук для удобного использования контекста
export const useDreams = () => {
  const context = useContext(DreamContext);
  if (context === undefined) {
    throw new Error('useDreams must be used within a DreamProvider');
  }
  return context;
};
