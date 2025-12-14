import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from '@/shared/api';
import type { UserStats } from '@/shared/api/api-client';

interface UseStatsReturn {
  stats: UserStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const api = useApiClient();

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.stats.get();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
