import { useState } from 'react';
import { useCodePreview } from '../../hooks';
import { CodePreviewView } from './CodePreview';
import { PREVIEW_TABS, type PreviewTab } from '../../types';

export function CodePreviewContainer() {
  const [activeTab, setActiveTab] = useState<PreviewTab>('entities');
  const code = useCodePreview(activeTab);
  
  return (
    <CodePreviewView
      activeTab={activeTab}
      tabs={PREVIEW_TABS}
      code={code}
      onTabChange={setActiveTab}
    />
  );
}
