import { useRef, useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { ChevronLeft, ChevronRight, Code2, Database, FileJson } from 'lucide-react';
import { cn } from '@/shared/utils';
import type { PreviewTab, PreviewTabConfig } from '../../types';

interface CodePreviewViewProps {
  activeTab: PreviewTab;
  tabs: PreviewTabConfig[];
  code: string;
  onTabChange: (tab: PreviewTab) => void;
}

// Tab categories for visual grouping
const TAB_CATEGORIES = {
  csharp: ['entities', 'dbcontext', 'dtos', 'controller', 'repository', 'services'],
  sql: ['migration', 'migration-postgres', 'migration-mysql', 'migration-sqlite'],
  json: ['swagger'],
} as const;

// Get icon for tab based on language
function getTabIcon(language: string) {
  switch (language) {
    case 'csharp':
      return <Code2 className="w-3.5 h-3.5" />;
    case 'sql':
      return <Database className="w-3.5 h-3.5" />;
    case 'json':
      return <FileJson className="w-3.5 h-3.5" />;
    default:
      return <Code2 className="w-3.5 h-3.5" />;
  }
}

// Get category label
function getCategoryForTab(tabId: string): string {
  if (TAB_CATEGORIES.csharp.includes(tabId as typeof TAB_CATEGORIES.csharp[number])) return 'C#';
  if (TAB_CATEGORIES.sql.includes(tabId as typeof TAB_CATEGORIES.sql[number])) return 'SQL';
  if (TAB_CATEGORIES.json.includes(tabId as typeof TAB_CATEGORIES.json[number])) return 'API';
  return '';
}

export function CodePreviewView({
  activeTab,
  tabs,
  code,
  onTabChange,
}: CodePreviewViewProps) {
  const currentTab = tabs.find((t) => t.id === activeTab);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll state
  const checkScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  }, []);

  // Initialize and listen for scroll/resize
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollState();
    container.addEventListener('scroll', checkScrollState);
    window.addEventListener('resize', checkScrollState);

    // Check after a short delay for initial render
    const timeout = setTimeout(checkScrollState, 100);

    return () => {
      container.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
      clearTimeout(timeout);
    };
  }, [checkScrollState]);

  // Scroll handlers
  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Scroll active tab into view
  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeButton = container?.querySelector(`[data-tab="${activeTab}"]`);
    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      if (buttonRect.left < containerRect.left) {
        container.scrollBy({ left: buttonRect.left - containerRect.left - 16, behavior: 'smooth' });
      } else if (buttonRect.right > containerRect.right) {
        container.scrollBy({ left: buttonRect.right - containerRect.right + 16, behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  // Group tabs by category for visual distinction
  const groupedTabs = tabs.reduce((acc, tab) => {
    const category = getCategoryForTab(tab.id);
    if (!acc[category]) acc[category] = [];
    acc[category].push(tab);
    return acc;
  }, {} as Record<string, PreviewTabConfig[]>);

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Modern Tab Bar */}
      <div className="relative flex items-center border-b border-border bg-background/50">
        {/* Left scroll button */}
        <button
          onClick={scrollLeft}
          className={cn(
            "absolute left-0 z-10 h-full px-1.5 bg-gradient-to-r from-background via-background to-transparent",
            "flex items-center justify-center transition-opacity duration-200",
            "hover:text-foreground focus:outline-none",
            canScrollLeft ? "opacity-100 text-muted-foreground" : "opacity-0 pointer-events-none"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable tabs container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto scrollbar-none scroll-smooth px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex items-center gap-1 py-1.5 min-w-max">
            {Object.entries(groupedTabs).map(([category, categoryTabs], groupIndex) => (
              <div key={category} className="flex items-center">
                {/* Category separator */}
                {groupIndex > 0 && (
                  <div className="h-5 w-px bg-border mx-2" />
                )}
                
                {/* Category label */}
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider px-1.5 mr-1">
                  {category}
                </span>

                {/* Tabs in this category */}
                <div className="flex items-center gap-0.5">
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab.id}
                      data-tab={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={cn(
                        "group relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium",
                        "transition-all duration-200 ease-out",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                      )}
                    >
                      <span className={cn(
                        "transition-transform duration-200",
                        activeTab === tab.id ? "scale-110" : "group-hover:scale-105"
                      )}>
                        {getTabIcon(tab.language)}
                      </span>
                      <span>{tab.label}</span>
                      
                      {/* Active indicator dot */}
                      {activeTab === tab.id && (
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right scroll button */}
        <button
          onClick={scrollRight}
          className={cn(
            "absolute right-0 z-10 h-full px-1.5 bg-gradient-to-l from-background via-background to-transparent",
            "flex items-center justify-center transition-opacity duration-200",
            "hover:text-foreground focus:outline-none",
            canScrollRight ? "opacity-100 text-muted-foreground" : "opacity-0 pointer-events-none"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Code Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={currentTab?.language || 'plaintext'}
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'none',
            folding: true,
            automaticLayout: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
          }}
        />
      </div>
    </div>
  );
}
