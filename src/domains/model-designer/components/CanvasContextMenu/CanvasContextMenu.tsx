import { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onAction: (action: string) => void;
  onClose: () => void;
}

export function CanvasContextMenu({ x, y, onAction, onClose }: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  
  const menuItems = [
    { action: 'add-entity', label: 'Add Entity', icon: Plus, shortcut: 'N' },
  ];
  
  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item) => (
        <button
          key={item.action}
          className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
          onClick={() => onAction(item.action)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.label}</span>
          {item.shortcut && (
            <span className="ml-auto text-xs tracking-widest text-muted-foreground">
              {item.shortcut}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
