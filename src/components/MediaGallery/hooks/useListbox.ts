import { useCallback, useEffect, useId, useRef } from 'react';

export type FilterValue = string | number;

/**
 * Keyboard and focus behaviour for a listbox-style dropdown.
 *
 * The desktop sidebar and the mobile filter bar render different markup for
 * the same control, so the behaviour lives here rather than being written
 * twice: roles and ids, focus moving into the list on open, arrow/Home/End
 * navigation, Enter/Space to select, Escape to dismiss and return focus, and
 * dismissal on outside click.
 */
export function useListbox({
  isOpen,
  setIsOpen,
  options,
  selectedValue,
  onSelect,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  options: FilterValue[];
  selectedValue: FilterValue;
  onSelect: (value: FilterValue) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const items = useCallback(
    () => Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []),
    []
  );

  // Dismiss on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Move focus into the list when it opens, onto the current selection
  useEffect(() => {
    if (!isOpen) return;
    const list = items();
    const selectedIndex = options.findIndex((o) => o === selectedValue);
    list[selectedIndex >= 0 ? selectedIndex : 0]?.focus();
  }, [isOpen, items, options, selectedValue]);

  const close = useCallback(
    (returnFocus = true) => {
      setIsOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [setIsOpen]
  );

  const handleSelect = useCallback(
    (value: FilterValue) => {
      onSelect(value);
      close();
    },
    [onSelect, close]
  );

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(true);
      } else if (event.key === 'Escape') {
        close(false);
      }
    },
    [setIsOpen, close]
  );

  const handleOptionKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, value: FilterValue) => {
      const list = items();
      const index = list.indexOf(event.currentTarget);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          list[(index + 1) % list.length]?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          list[(index - 1 + list.length) % list.length]?.focus();
          break;
        case 'Home':
          event.preventDefault();
          list[0]?.focus();
          break;
        case 'End':
          event.preventDefault();
          list[list.length - 1]?.focus();
          break;
        case 'Escape':
          event.preventDefault();
          close();
          break;
        case 'Tab':
          // Tabbing away dismisses, but focus lands where it normally would.
          setIsOpen(false);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleSelect(value);
          break;
      }
    },
    [items, close, setIsOpen, handleSelect]
  );

  return {
    containerRef,
    triggerRef,
    listRef,
    listboxId,
    handleSelect,
    handleTriggerKeyDown,
    handleOptionKeyDown,
  };
}
