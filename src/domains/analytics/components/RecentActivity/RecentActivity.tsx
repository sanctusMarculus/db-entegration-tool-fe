import { formatDistanceToNow } from 'date-fns';
import {
  FolderPlus,
  FilePen,
  Settings,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import type { ActivityItem } from '@/shared/api/api-client';

const activityIcons: Record<string, LucideIcon> = {
  create: FolderPlus,
  update: FilePen,
  delete: Trash2,
  default: Settings,
};

const resourceLabels: Record<string, string> = {
  project: 'Project',
  schema: 'Schema',
};

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.action] || activityIcons.default;
            const resourceLabel = resourceLabels[activity.resourceType] || activity.resourceType;
            const actionLabel = activity.action.charAt(0).toUpperCase() + activity.action.slice(1);
            const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
              addSuffix: true,
            });

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {actionLabel} {resourceLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.resourceName || activity.resourceId}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground">{timeAgo}</time>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
