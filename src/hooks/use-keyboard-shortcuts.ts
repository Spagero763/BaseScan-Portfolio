'use client';

import { useEffect, useCallback } from 'react';

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};

type KeyboardShortcut = {
  combo: KeyCombo;
  action: () => void;
  description?: string;
};

/**
 * Hook to handle keyboard shortcuts
 * @param shortcuts Array of keyboard shortcuts to register
 * @param enabled Whether shortcuts are active (default: true)
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    for (const shortcut of shortcuts) {
      const { combo, action } = shortcut;
      
      const keyMatches = event.key.toLowerCase() === combo.key.toLowerCase();
      const ctrlMatches = !!combo.ctrl === (event.ctrlKey || event.metaKey);
      const shiftMatches = !!combo.shift === event.shiftKey;
      const altMatches = !!combo.alt === event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault();
        action();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Common keyboard shortcuts for the app
 */
export const KEYBOARD_SHORTCUTS = {
  REFRESH: { key: 'r', description: 'Refresh data' },
  DEPOSIT: { key: 'd', description: 'Focus deposit input' },
  WITHDRAW: { key: 'w', description: 'Focus withdraw input' },
  CONNECT: { key: 'c', description: 'Connect wallet' },
  ESCAPE: { key: 'Escape', description: 'Close dialogs' },
} as const;

/**
 * Format a key combo for display
 */
export function formatKeyCombo(combo: KeyCombo): string {
  const parts: string[] = [];
  if (combo.ctrl) parts.push('Ctrl');
  if (combo.shift) parts.push('Shift');
  if (combo.alt) parts.push('Alt');
  parts.push(combo.key.toUpperCase());
  return parts.join(' + ');
}
