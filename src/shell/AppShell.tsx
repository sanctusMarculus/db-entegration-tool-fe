import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/shared/ui';
import { Layout } from '@/components';
import { DashboardPage, DesignerPage, AnalyticsPage } from '@/pages';
import { useDataSync } from '@/shared/api';
import { useUserSession } from '@/shared/hooks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * UserSessionGuard - Ensures user data is cleared when switching accounts
 * Must run BEFORE DataSyncProvider to clear stale data first
 */
function UserSessionGuard({ children }: { children: React.ReactNode }) {
  const { isReady } = useUserSession();
  
  // Wait for user session check to complete
  if (!isReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  return <>{children}</>;
}

/**
 * DataSyncProvider - Syncs data from backend on app load
 */
function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useDataSync();
  
  // Show loading state while syncing
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    );
  }
  
  // Show error but allow continuing (fallback to local data)
  if (error) {
    console.warn('Data sync error:', error);
  }
  
  return <>{children}</>;
}

/**
 * AppShell - The authenticated application shell
 * 
 * Everything inside this component assumes an authenticated identity exists.
 * No auth checks, guards, or token parsing happens here.
 * 
 * This is where your real application lives.
 */
export function AppShell() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <BrowserRouter>
          <UserSessionGuard>
            <DataSyncProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="designer/:workspaceId" element={<DesignerPage />} />
                </Route>
              </Routes>
            </DataSyncProvider>
          </UserSessionGuard>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
