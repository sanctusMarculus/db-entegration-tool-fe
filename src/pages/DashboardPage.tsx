import { WorkspaceListContainer } from '@/domains/dashboard';

export function DashboardPage() {
  return (
    <div className="h-full overflow-auto p-6">
      <WorkspaceListContainer />
    </div>
  );
}
