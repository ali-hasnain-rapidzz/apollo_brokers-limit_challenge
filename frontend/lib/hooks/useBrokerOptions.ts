'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Broker } from '@/lib/types';

async function fetchBrokers(search: string) {
  const response = await apiClient.get<Broker[]>('/brokers/', {
    params: { search },
  });
  return response.data;
}

async function fetchBrokerById(id: string) {
  const response = await apiClient.get<Broker>(`/brokers/${id}/`);
  return response.data;
}

export function useBrokerOptions(search = '') {
  return useQuery({
    queryKey: ['brokers', search],
    queryFn: () => fetchBrokers(search),
    enabled: search.length > 0,
    staleTime: 30_000,
  });
}

export function useBrokerById(id: string) {
  return useQuery({
    queryKey: ['broker', id],
    queryFn: () => fetchBrokerById(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}
