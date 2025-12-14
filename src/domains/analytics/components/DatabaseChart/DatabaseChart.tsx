import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import type { DatabaseTypeCount } from '@/shared/api/api-client';

const COLORS: Record<string, string> = {
  postgresql: '#336791',
  mysql: '#00758F',
  sqlite: '#003B57',
  sqlserver: '#CC2927',
  mongodb: '#47A248',
  other: '#6B7280',
};

interface DatabaseChartProps {
  data: DatabaseTypeCount[];
}

export function DatabaseChart({ data }: DatabaseChartProps) {
  const chartData = data.map((item) => ({
    name: item.databaseType ? item.databaseType.charAt(0).toUpperCase() + item.databaseType.slice(1) : 'Unknown',
    value: item.count,
    key: item.databaseType || 'other',
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects by Database</CardTitle>
          <CardDescription>Distribution of your projects by database type</CardDescription>
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
        <CardTitle>Projects by Database</CardTitle>
        <CardDescription>Distribution of your projects by database type</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={COLORS[entry.key as keyof typeof COLORS] || COLORS.other}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
