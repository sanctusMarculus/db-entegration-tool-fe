import { FolderKanban, Database, Layers, Activity } from 'lucide-react';
import {
  StatCard,
  DatabaseChart,
  StatusChart,
  RecentActivity,
  useStats,
} from '@/domains/analytics';
import { Skeleton } from '@/shared/ui';

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
      <Skeleton className="h-[300px]" />
    </div>
  );
}

export function AnalyticsPage() {
  const { stats, isLoading, error } = useStats();

  if (error) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Overview of your projects and activity
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-muted-foreground">
            Failed to load analytics data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Overview of your projects and activity
        </p>
      </div>

      {isLoading || !stats ? (
        <StatsSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={FolderKanban}
              description="All your database projects"
            />
            <StatCard
              title="Total Schemas"
              value={stats.totalSchemas}
              icon={Database}
              description="Schema models created"
            />
            <StatCard
              title="Total Entities"
              value={stats.totalEntities}
              icon={Layers}
              description="Tables and entities defined"
            />
            <StatCard
              title="Active Projects"
              value={stats.activeProjects}
              icon={Activity}
              description="Currently active projects"
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <DatabaseChart data={stats.projectsByDatabaseType} />
            <StatusChart data={stats.projectsByStatus} />
          </div>

          {/* Recent Activity */}
          <RecentActivity activities={stats.recentActivity} />
        </div>
      )}
    </div>
  );
}
