'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

import { paths } from 'src/routes/paths';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { DashboardContent } from 'src/layouts/dashboard';
import { useCompanyDetails, useApproveCompany, useRejectCompany } from 'src/lib/hooks/use-approval';

// ----------------------------------------------------------------------

export default function CompanyDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const companyId = params.id as string;

  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: company, isLoading, error } = useCompanyDetails(companyId);
  const approveCompanyMutation = useApproveCompany();
  const rejectCompanyMutation = useRejectCompany();

  const handleApprove = async () => {
    try {
      await approveCompanyMutation.mutateAsync(companyId);
      // Success notification (could use a custom toast/notification system)
      console.log('Company approved successfully!');
      setApproveConfirmOpen(false);
      router.push(paths.dashboard.approvals.companies.pending);
    } catch (error: any) {
      console.error('Failed to approve company:', error?.message || error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      console.warn('Please provide a rejection reason');
      return;
    }

    try {
      await rejectCompanyMutation.mutateAsync({
        companyId,
        data: { rejectionReason },
      });
      console.log('Company rejected successfully!');
      setRejectDialogOpen(false);
      setRejectionReason('');
      router.push(paths.dashboard.approvals.companies.pending);
    } catch (error: any) {
      console.error('Failed to reject company:', error?.message || error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !company) {
    return (
      <DashboardContent>
        <EmptyContent
          filled
          title="Company Not Found"
          description="The requested company could not be found."
          action={
            <Button
              variant="contained"
              onClick={() => router.push(paths.dashboard.approvals.companies.pending)}
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
            >
              Back to Companies
            </Button>
          }
        />
      </DashboardContent>
    );
  }

  const isPending = company.approvalStatus === 'PENDING';

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Company Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Approvals', href: paths.dashboard.approvals.root },
          { name: 'Companies', href: paths.dashboard.approvals.companies.pending },
          { name: company.name },
        ]}
        action={
          isPending && (
            <Stack direction="row" spacing={1}>
              <LoadingButton
                variant="contained"
                color="success"
                loading={approveCompanyMutation.isPending}
                onClick={() => setApproveConfirmOpen(true)}
                startIcon={<Iconify icon="eva:checkmark-fill" />}
              >
                Approve
              </LoadingButton>

              <LoadingButton
                variant="outlined"
                color="error"
                loading={rejectCompanyMutation.isPending}
                onClick={() => setRejectDialogOpen(true)}
                startIcon={<Iconify icon="eva:close-fill" />}
              >
                Reject
              </LoadingButton>
            </Stack>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        {/* Company Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Company Information" subheader="Basic company details" />
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Avatar
                  src={company.logo}
                  alt={company.name}
                  sx={{ width: 120, height: 120 }}
                  variant="rounded"
                >
                  {company.name.charAt(0).toUpperCase()}
                </Avatar>

                <Typography variant="h5" textAlign="center">
                  {company.name}
                </Typography>

                <Label
                  variant="soft"
                  color={
                    (company.approvalStatus === 'APPROVED' && 'success') ||
                    (company.approvalStatus === 'PENDING' && 'warning') ||
                    (company.approvalStatus === 'REJECTED' && 'error') ||
                    'default'
                  }
                  sx={{ textTransform: 'capitalize' }}
                >
                  {company.approvalStatus}
                </Label>

                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Iconify icon="eva:briefcase-fill" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {company.workField}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Iconify icon="eva:pin-fill" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {company.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Iconify icon="eva:people-fill" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {company.size} employees
                    </Typography>
                  </Box>

                  {company.website && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Iconify
                        icon="eva:external-link-fill"
                        sx={{ mr: 1, color: 'text.secondary' }}
                      />
                      <Typography
                        variant="body2"
                        component="a"
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: 'primary.main', textDecoration: 'none' }}
                      >
                        Website
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Details Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Company Details"
              subheader="Detailed information about the company"
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {company.description || 'No description provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Registration Details
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Commercial Register
                      </Typography>
                      <Typography variant="body2">
                        {company.commercial_register || 'Not provided'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Tax Number
                      </Typography>
                      <Typography variant="body2">
                        {company.tax_number || 'Not provided'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Submission Date
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(company.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Last Updated
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(company.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        open={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        title="Approve Company"
        content={`Are you sure you want to approve "${company.name}"? This action cannot be undone and the company will be able to post jobs.`}
        action={
          <LoadingButton
            variant="contained"
            color="success"
            onClick={handleApprove}
            loading={approveCompanyMutation.isPending}
          >
            Approve Company
          </LoadingButton>
        }
      />

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Company</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Are you sure you want to reject "{company.name}"? Please provide a detailed reason for
            rejection.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please explain why this company is being rejected..."
            helperText="This reason will be sent to the company owner and they will not be able to post jobs."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleReject}
            loading={rejectCompanyMutation.isPending}
          >
            Reject Company
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
