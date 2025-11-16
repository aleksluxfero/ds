import React, { useState, useRef } from 'react';
import { XIcon } from '../icons';

interface DreamTagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  allTags: string[];
  setAllTags: (tags: string[]) => void;
}

const DreamTagInput: React.FC<DreamTagInputProps> = ({ tags, setTags, allTags, setAllTags }) => {
  const [currentTag, setCurrentTag] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [isTagInputFocused, setIsTagInputFocused] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagInputBlurTimeout = useRef<number | null>(null);

  const handleAddTag = (tag: string) => {
    const cleanedTag = tag.trim().toLowerCase();
    if (cleanedTag && !tags.includes(cleanedTag)) {
      setTags([...tags, cleanedTag]);
      if (!allTags.includes(cleanedTag)) {
        setAllTags([...allTags, cleanedTag].sort());
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
  );
};

export default React.memo(DreamTagInput);
