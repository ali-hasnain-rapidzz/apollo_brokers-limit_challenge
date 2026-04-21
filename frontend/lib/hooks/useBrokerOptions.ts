'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Broker } from '@/lib/types';

async function fetchBrokers(search: string) {
  const response = await apiClient.get<Broker[]>('/brokers/', {
    params: search ? { search } : undefined,
  });
  return response.data;
}

// Server-side searched hook — only fetches brokers matching the query string,
// so the dropdown scales regardless of total broker count without loading everything upfront.
// TODO (Ali): swap ListboxComponent for a react-window VirtualizedList before final submission
// to get true DOM-level virtualization on top of the server-side filtering.
export function useBrokerOptions(search = '') {
  return useQuery({
    queryKey: ['brokers', search],
    queryFn: () => fetchBrokers(search),
    enabled: true,
    staleTime: 30_000,
  });
}
