'use client';

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Link as MuiLink,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import { SubmissionPriority, SubmissionStatus } from '@/lib/types';

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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="text" width={320} height={40} />
      {[1, 2, 3, 4].map((i) => (
        <Card variant="outlined" key={i}>
          <CardContent>
            <Skeleton variant="text" width={160} height={28} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={80} />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
      {message}
    </Typography>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';

  const { data, isLoading, isError } = useSubmissionDetail(submissionId);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>

        {/* Back link */}
        <Box>
          <MuiLink component={Link} href="/submissions" underline="hover" variant="body2">
            ← Back to submissions
          </MuiLink>
        </Box>

        {/* Loading */}
        {isLoading && <LoadingSkeleton />}

        {/* Error */}
        {isError && (
          <Alert severity="error">
            Failed to load submission. It may have been removed or the ID is invalid.
          </Alert>
        )}

        {/* Content */}
        {data && (
          <>
            {/* Header */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip
                  label={STATUS_LABEL[data.status]}
                  color={STATUS_COLOR[data.status]}
                  size="small"
                />
                <Chip
                  label={data.priority}
                  color={PRIORITY_COLOR[data.priority]}
                  size="small"
                  variant="outlined"
                />
              </Stack>
              <Typography variant="h4" component="h1">
                {data.company.legalName}
              </Typography>
              <Typography color="text.secondary">
                Submitted by {data.broker.name} · Owner: {data.owner.fullName}
              </Typography>
            </Box>

            {/* Overview */}
            <SectionCard title="Overview">
              <Stack spacing={2}>
                {data.summary && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Summary
                    </Typography>
                    <Typography variant="body2">{data.summary}</Typography>
                  </Box>
                )}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Broker
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {data.broker.name}
                    </Typography>
                    {data.broker.primaryContactEmail && (
                      <Typography variant="caption" color="text.secondary">
                        {data.broker.primaryContactEmail}
                      </Typography>
                    )}
                  </Box>

                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Company
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {data.company.legalName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[data.company.industry, data.company.headquartersCity]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  </Box>

                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Owner
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {data.owner.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.owner.email}
                    </Typography>
                  </Box>

                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {new Date(data.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Updated {new Date(data.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </SectionCard>

            {/* Contacts */}
            <SectionCard title={`Contacts (${data.contacts.length})`}>
              {data.contacts.length === 0 ? (
                <EmptyState message="No contacts on this submission." />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {contact.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {contact.role || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {contact.email ? (
                              <MuiLink href={`mailto:${contact.email}`} variant="body2">
                                {contact.email}
                              </MuiLink>
                            ) : (
                              <Typography variant="body2" color="text.disabled">—</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {contact.phone || '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </SectionCard>

            {/* Documents */}
            <SectionCard title={`Documents (${data.documents.length})`}>
              {data.documents.length === 0 ? (
                <EmptyState message="No documents attached to this submission." />
              ) : (
                <Stack divider={<Divider />} spacing={0}>
                  {data.documents.map((doc) => (
                    <Box
                      key={doc.id}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}
                    >
                      <Box>
                        {doc.fileUrl ? (
                          <MuiLink href={doc.fileUrl} target="_blank" rel="noreferrer" variant="body2" fontWeight={500}>
                            {doc.title}
                          </MuiLink>
                        ) : (
                          <Typography variant="body2" fontWeight={500}>
                            {doc.title}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip label={doc.docType} size="small" variant="outlined" />
                    </Box>
                  ))}
                </Stack>
              )}
            </SectionCard>

            {/* Notes */}
            <SectionCard title={`Notes (${data.notes.length})`}>
              {data.notes.length === 0 ? (
                <EmptyState message="No notes on this submission yet." />
              ) : (
                <Stack spacing={2}>
                  {data.notes.map((note) => (
                    <Box key={note.id}>
                      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                        <Typography variant="body2" fontWeight={500}>
                          {note.authorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {note.body}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </SectionCard>
          </>
        )}
      </Stack>
    </Container>
  );
}
