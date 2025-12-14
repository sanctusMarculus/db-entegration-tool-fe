import { useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createApiClient, type ApiClient } from './api-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/**
 * Hook to get a configured API client instance
 * Uses Clerk's getToken for authentication
 */
export function useApiClient(): ApiClient {
  const { getToken } = useAuth();
  
  const client = useMemo(() => createApiClient({
    baseUrl: API_URL,
    getToken: () => getToken(),
  }), [getToken]);
  
  return client;
}
