import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import type { StatusCount } from '@/shared/api/api-client';

const COLORS: Record<string, string> = {
  active: '#22C55E',
  archived: '#6B7280',
  draft: '#EAB308',
};

interface StatusChartProps {
  data: StatusCount[];
}

export function StatusChart({ data }: StatusChartProps) {
  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown',
      value: item.count,
      key: item.status || 'unknown',
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects by Status</CardTitle>
          <CardDescription>Overview of project statuses</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects by Status</CardTitle>
        <CardDescription>Overview of project statuses</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={COLORS[entry.key as keyof typeof COLORS] || '#6B7280'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
