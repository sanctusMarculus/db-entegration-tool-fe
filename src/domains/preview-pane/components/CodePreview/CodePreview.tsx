import Editor from '@monaco-editor/react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui';
import type { PreviewTab, PreviewTabConfig } from '../../types';

interface CodePreviewViewProps {
  activeTab: PreviewTab;
  tabs: PreviewTabConfig[];
  code: string;
  onTabChange: (tab: PreviewTab) => void;
}

export function CodePreviewView({
  activeTab,
  tabs,
  code,
  onTabChange,
}: CodePreviewViewProps) {
  const currentTab = tabs.find((t) => t.id === activeTab);
  
  return (
    <div className="h-full flex flex-col bg-card">
      <div className="border-b border-border px-2 py-1">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as PreviewTab)}>
          <TabsList className="h-8">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-xs px-3 py-1">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
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
            padding: { top: 8 },
            renderLineHighlight: 'none',
            folding: true,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
