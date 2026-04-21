'use client';

import { keepPreviousData, QueryKey, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import {
  PaginatedResponse,
  SubmissionDetail,
  SubmissionListFilters,
  SubmissionListItem,
} from '@/lib/types';

const SUBMISSIONS_QUERY_KEY = 'submissions';

async function fetchSubmissions(filters: SubmissionListFilters) {
  const response = await apiClient.get<PaginatedResponse<SubmissionListItem>>('/submissions/', {
    params: {
      status: filters.status,
      brokerId: filters.brokerId,
      companySearch: filters.companySearch,
      hasDocuments: filters.hasDocuments,
      hasNotes: filters.hasNotes,
      createdFrom: filters.createdFrom,
      createdTo: filters.createdTo,
      page: filters.page,
    },
  });
  return response.data;
}

async function fetchSubmissionDetail(id: string | number) {
  if (!id) {
    throw new Error('Submission id is required');
  }

  const response = await apiClient.get<SubmissionDetail>(`/submissions/${id}/`);
  return response.data;
}

export function useSubmissionsList(filters: SubmissionListFilters) {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, filters] as QueryKey,
    queryFn: () => fetchSubmissions(filters),
    enabled: true,
    placeholderData: keepPreviousData,
  });
}

export function useSubmissionDetail(id: string | number) {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, id],
    queryFn: () => fetchSubmissionDetail(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

