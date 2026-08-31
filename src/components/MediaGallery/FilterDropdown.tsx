import clsx from 'clsx';
import { useListbox, type FilterValue } from './hooks/useListbox';

export type { FilterValue };

/**
 * Where the dropdown is being rendered.
 *
 * `sidebar` is the desktop filter panel: it sits on a raised card, so its
 * surfaces are a step lighter than the page, and the field name is a visible
 * label above the trigger. `bar` is the mobile filter row, which sits directly
 * on the page background and has no room for a label, so the trigger carries
 * the field name itself until a value is chosen.
 */
type FilterDropdownVariant = 'sidebar' | 'bar';

const VARIANTS: Record<
  FilterDropdownVariant,
  { trigger: string; panel: string; option: string; showLabel: boolean; showCheck: boolean }
> = {
  sidebar: {
    trigger: 'bg-white dark:bg-gray-700',
    panel: 'left-0 right-0 bg-white dark:bg-gray-700 dark:border-gray-600',
    option: 'hover:bg-gray-50 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600',
    showLabel: true,
    showCheck: false,
  },
  bar: {
    trigger: 'bg-white dark:bg-gray-800',
    panel: 'left-0 w-full sm:w-64 bg-white dark:bg-gray-800 dark:border-gray-600',
    option: 'hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700',
    showLabel: false,
    showCheck: true,
  },
};

interface FilterDropdownProps {
  /** Field name, e.g. "Genre". Shown above the trigger in the sidebar variant. */
  label: string;
  /** Localized aria-label for the trigger, e.g. "Filter by Genre". */
  ariaLabel: string;
  /** Localized text for the "All" sentinel; the stored value stays 'All'. */
  allLabel: string;
  selectedValue: FilterValue;
  options: FilterValue[];
  onSelect: (value: FilterValue) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  /** Called just before this dropdown opens, so siblings can close themselves. */
  onOpen?: () => void;
  visible: boolean;
  delay: string;
  variant?: FilterDropdownVariant;
}

export default function FilterDropdown({
  label,
  ariaLabel,
  allLabel,
  selectedValue,
  options,
  onSelect,
  isOpen,
  setIsOpen,
  onOpen,
  visible,
  delay,
  variant = 'sidebar',
}: FilterDropdownProps) {
  const {
    containerRef,
    triggerRef,
    listRef,
    listboxId,
    handleSelect,
    handleTriggerKeyDown,
    handleOptionKeyDown,
  } = useListbox({ isOpen, setIsOpen, onSelect });

  const styles = VARIANTS[variant];
  const display = (value: FilterValue) => (value === 'All' ? allLabel : value);

  // With no visible label to name the field, the bar variant falls back to the
  // field name until the user picks something.
  const triggerText = styles.showLabel || selectedValue !== 'All' ? display(selectedValue) : label;

  const handleToggle = () => {
    if (!isOpen) onOpen?.();
    setIsOpen(!isOpen);
  };

  return (
    <div
      ref={containerRef}
      className={clsx('relative transition-all duration-700 ease-out', {
        'w-full sm:flex-1': variant === 'bar',
        'opacity-100 translate-y-0': visible,
        'opacity-0 translate-y-4': !visible,
        'z-50': isOpen, // Higher z-index when dropdown is open
      })}
      style={{ transitionDelay: delay }}
    >
      {styles.showLabel && (
        <label
          id={`${listboxId}-label`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        className={clsx(
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 dark:text-white shadow-sm hover:shadow-md cursor-pointer relative z-10',
          styles.trigger
        )}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
      >
        <span className="truncate text-left min-w-0">{triggerText}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          {...(styles.showLabel
            ? { 'aria-labelledby': `${listboxId}-label` }
            : { 'aria-label': ariaLabel })}
          className={clsx(
            'absolute mt-2 border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-64 overflow-y-auto',
            styles.panel
          )}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selectedValue === option}
                onClick={() => handleSelect(option)}
                onKeyDown={(event) => handleOptionKeyDown(event, option)}
                className={clsx(
                  'w-full text-left px-4 py-2.5 text-sm focus:outline-none transition-colors flex items-center justify-between cursor-pointer',
                  styles.option,
                  selectedValue === option
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-900 dark:text-gray-100'
                )}
              >
                <span className="truncate min-w-0">{display(option)}</span>
                {styles.showCheck && selectedValue === option && (
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
