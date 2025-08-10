import { useRef, useEffect } from 'react';
import clsx from 'clsx';

interface FilterDropdownProps {
  label: string;
  selectedValue: string | number | 'All';
  options: (string | number)[];
  onSelect: (value: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  visible: boolean;
  delay: string;
}

export default function FilterDropdown({
  label,
  selectedValue,
  options,
  onSelect,
  isOpen,
  setIsOpen,
  visible,
  delay,
}: FilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const handleSelect = (value: string | number) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div
      className={clsx('relative transition-all duration-700 ease-out', {
        'opacity-100 translate-y-0': visible,
        'opacity-0 translate-y-4': !visible,
        'z-50': isOpen, // Higher z-index when dropdown is open
      })}
      style={{ transitionDelay: delay }}
      ref={dropdownRef}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md cursor-pointer relative z-10"
        aria-expanded={isOpen}
      >
        <span className="truncate text-left min-w-0">
          {selectedValue === 'All' ? 'All' : selectedValue}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[9999] max-h-64 overflow-y-auto">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer ${
                  selectedValue === option
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
