import { useEffect, useCallback } from 'react';
import { useModelStore } from '@/shared/stores';
import { useCanvasActions } from './useCanvasActions';

interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useHotkeys() {
  const {
    handleAddEntity,
    handleAddField,
    handleDeleteEntity,
    handleDuplicateEntity,
    handleClearSelection,
    selectedEntityId,
  } = useCanvasActions();
  
  const model = useModelStore((state) => state.model);
  
  const getNewEntityPosition = useCallback(() => {
    // Get viewport center or offset from last entity
    if (!model || model.entities.length === 0) {
      return { x: 100, y: 100 };
    }
    const lastEntity = model.entities[model.entities.length - 1];
    return {
      x: lastEntity.position.x + 300,
      y: lastEntity.position.y,
    };
  }, [model]);
  
  const hotkeys: HotkeyConfig[] = [
    {
      key: 'n',
      description: 'New Entity',
      action: () => {
        const position = getNewEntityPosition();
        handleAddEntity(position);
      },
    },
    {
      key: 'f',
      description: 'Add Field to selected entity',
      action: () => {
        if (selectedEntityId) {
          handleAddField(selectedEntityId);
        }
      },
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Duplicate selected entity',
      action: () => {
        if (selectedEntityId) {
          handleDuplicateEntity(selectedEntityId);
        }
      },
    },
    {
      key: 'Delete',
      description: 'Delete selected entity',
      action: () => {
        if (selectedEntityId) {
          handleDeleteEntity(selectedEntityId);
        }
      },
    },
    {
      key: 'Backspace',
      description: 'Delete selected entity',
      action: () => {
        if (selectedEntityId) {
          handleDeleteEntity(selectedEntityId);
        }
      },
    },
    {
      key: 'Escape',
      description: 'Clear selection',
      action: () => {
        handleClearSelection();
      },
    },
  ];
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }
      
      for (const hotkey of hotkeys) {
        const ctrlMatch = hotkey.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = hotkey.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = hotkey.alt ? e.altKey : !e.altKey;
        
        if (e.key === hotkey.key && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          hotkey.action();
          break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeys]);
  
  return { hotkeys };
}
