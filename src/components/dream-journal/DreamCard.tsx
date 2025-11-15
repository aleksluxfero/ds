import React, { useRef, useEffect } from 'react';
import { Dream } from '@/types/dream';
import { Trash2Icon, EditIcon } from './icons';
import { getDreamTypeLabel, getDreamTypeStyles } from './utils';

interface DreamCardProps {
  dream: Dream;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
}

const DreamCard: React.FC<DreamCardProps> = ({ dream, onDelete, onEdit, onView }) => {
  const formattedDate = dream.date 
    ? new Date(Number(dream.date)).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Дата неизвестна';

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(dream.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(dream.id);
  };
  
  const styles = getDreamTypeStyles(dream.type);
  const tagsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = tagsContainerRef.current;
    if (!element) return;

    const onWheel = (e: WheelEvent) => {
      if (element.scrollWidth > element.clientWidth) {
        e.preventDefault();
        element.scrollLeft += e.deltaY + e.deltaX;
      }
    };

    element.addEventListener('wheel', onWheel);
    return () => element.removeEventListener('wheel', onWheel);
  }, []);


  return (
    <div className={`rounded-xl ${styles.container}`}>
      <div
        onClick={() => onView(dream.id)}
        aria-label={`Просмотреть сон: ${dream.title || "Без названия"}`}
        role="button"
        className={`
          w-full h-52 bg-white/5 backdrop-blur-md border 
          flex flex-col p-5 cursor-pointer
          ${styles.container ? 'rounded-[11px]' : 'rounded-xl'} 
          ${styles.card}
        `}
      >
        {/* === Header === */}
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-100 pr-4 truncate">{dream.title || "Без названия"}</h3>
          <div className={`text-xs font-semibold px-2 py-1 rounded-md flex-shrink-0 ${styles.badge}`}>
            {getDreamTypeLabel(dream.type)}
          </div>
        </div>

        {/* === Description === */}
        <div className="min-h-[2.5rem] mb-2">
            <p className={`${styles.descriptionColor} text-sm line-clamp-2`}>
              {dream.content || "Нет описания."}
            </p>
        </div>
          
        {/* === Tags === */}
        {(dream.tags?.length > 0) && (
            <div ref={tagsContainerRef} className="flex items-center flex-nowrap gap-2 overflow-x-auto overflow-y-hidden no-scrollbar pr-4 pb-2">
                {(dream.tags || []).map(tag => (
                    <span key={tag} className="flex items-center bg-purple-500/30 text-purple-200 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        {tag}
                    </span>
                ))}
            </div>
        )}
        
        {/* === Spacer (pushes footer to the bottom) === */}
        <div className="flex-grow" />
        
        {/* === Footer (Divider and Bottom Bar) === */}
        <div className="flex-shrink-0">
            <div className={`h-px w-full ${styles.divider}`}></div>
            <div className="flex justify-between items-center text-sm pt-3">
            <span className={styles.dateColor}>{formattedDate}</span>
            <div className="flex items-center space-x-2">
                <button 
                onClick={handleEditClick} 
                className={`p-1.5 rounded-full ${styles.iconColor} hover:bg-blue-500/20 hover:text-blue-400 transition-colors`} 
                aria-label="Редактировать"
                >
                <EditIcon className="w-4 h-4" />
                </button>
                <button 
                onClick={handleDeleteClick} 
                className={`p-1.5 rounded-full ${styles.iconColor} hover:bg-red-500/20 hover:text-red-400 transition-colors`} 
                aria-label="Удалить"
                >
                <Trash2Icon className="w-4 h-4" />
                </button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DreamCard);