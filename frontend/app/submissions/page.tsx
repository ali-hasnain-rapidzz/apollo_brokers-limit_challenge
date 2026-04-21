'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { BrokerAutocomplete } from './BrokerAutocomplete';
import { SubmissionListItem, SubmissionPriority, SubmissionStatus } from '@/lib/types';


const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

const STATUS_COLOR: Record<SubmissionStatus, 'primary' | 'warning' | 'success' | 'error'> = {
  new: 'primary',
  in_review: 'warning',
  closed: 'success',
  lost: 'error',
};

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  closed: 'Closed',
  lost: 'Lost',
};

const PRIORITY_COLOR: Record<SubmissionPriority, 'error' | 'warning' | 'info'> = {
  high: 'error',
  medium: 'warning',
  low: 'info',
};

const PAGE_SIZE = 10;

function SubmissionRow({ row }: { row: SubmissionListItem }) {
  const router = useRouter();

  return (
    <TableRow
      hover
      onClick={() => router.push(`/submissions/${row.id}`)}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {row.company.legalName}
        </Typography>
        {row.company.industry && (
          <Typography variant="caption" color="text.secondary">
            {row.company.industry}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2">{row.broker.name}</Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={STATUS_LABEL[row.status]}
          color={STATUS_COLOR[row.status]}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Chip
          label={row.priority}
          color={PRIORITY_COLOR[row.priority]}
          size="small"
          variant="outlined"
        />
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">{row.documentCount}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">{row.noteCount}</Typography>
      </TableCell>
      <TableCell sx={{ maxWidth: 220 }}>
        {row.latestNote ? (
          <Box>
            <Typography variant="caption" fontWeight={500} display="block">
              {row.latestNote.authorName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {row.latestNote.bodyPreview}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {new Date(row.createdAt).toLocaleDateString()}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 8 }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function SubmissionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const status = (searchParams.get('status') as SubmissionStatus) ?? '';
  const brokerId = searchParams.get('brokerId') ?? '';
  const hasDocuments = searchParams.get('hasDocuments') === 'true';
  const hasNotes = searchParams.get('hasNotes') === 'true';
  const createdFrom = searchParams.get('createdFrom') ?? '';
  const createdTo = searchParams.get('createdTo') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const [companyInput, setCompanyInput] = useState(searchParams.get('companySearch') ?? '');
  const companyInputRef = useRef(companyInput);
  companyInputRef.current = companyInput;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') {
      params.set('page', '1');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // Debounce company search — write to URL 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const current = companyInputRef.current;
      if (current) {
        params.set('companySearch', current);
      } else {
        params.delete('companySearch');
      }
      params.set('page', '1');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyInput]);

  const filters = {
    status: (status as SubmissionStatus) || undefined,
    brokerId: brokerId || undefined,
    companySearch: searchParams.get('companySearch') || undefined,
    hasDocuments: hasDocuments || undefined,
    hasNotes: hasNotes || undefined,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
    page,
  };

  const submissionsQuery = useSubmissionsList(filters);

  const totalPages = submissionsQuery.data
    ? Math.ceil(submissionsQuery.data.count / PAGE_SIZE)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Submissions
          </Typography>
          <Typography color="text.secondary">
            {submissionsQuery.data != null
              ? `${submissionsQuery.data.count} submission${submissionsQuery.data.count !== 1 ? 's' : ''}`
              : 'Browse incoming broker submissions'}
          </Typography>
        </Box>

        {/* Filters */}
        <Card variant="outlined">
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => updateParam('status', e.target.value)}
                fullWidth
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <BrokerAutocomplete
                value={brokerId}
                onChange={(id) => updateParam('brokerId', id)}
              />

              <TextField
                label="Company search"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                fullWidth
                placeholder="Search by company name…"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Created from"
                type="date"
                value={createdFrom}
                onChange={(e) => updateParam('createdFrom', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: 180 }}
              />
              <TextField
                label="Created to"
                type="date"
                value={createdTo}
                onChange={(e) => updateParam('createdTo', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: 180 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasDocuments}
                    onChange={(e) => updateParam('hasDocuments', e.target.checked ? 'true' : '')}
                  />
                }
                label="Has documents"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasNotes}
                    onChange={(e) => updateParam('hasNotes', e.target.checked ? 'true' : '')}
                  />
                }
                label="Has notes"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Error state */}
        {submissionsQuery.isError && (
          <Alert severity="error">
            Failed to load submissions. Please refresh the page or try again.
          </Alert>
        )}

        {/* Table */}
        {!submissionsQuery.isError && (
          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Broker</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell align="center">Docs</TableCell>
                    <TableCell align="center">Notes</TableCell>
                    <TableCell>Latest Note</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissionsQuery.isLoading ? (
                    <LoadingRows />
                  ) : submissionsQuery.data?.results.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">
                          No submissions match your filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissionsQuery.data?.results.map((row) => (
                      <SubmissionRow key={row.id} row={row} />
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => updateParam('page', String(value))}
                  color="primary"
                />
              </Box>
            )}
          </Paper>
        )}
      </Stack>
    </Container>
  );
}

export default function SubmissionsPage() {
  return (
    <Suspense>
      <SubmissionsContent />
    </Suspense>
  );
}
