import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { Company } from 'src/types/approval';
import { useApproveCompany, useRejectCompany } from 'src/lib/hooks/use-approval';

// ----------------------------------------------------------------------

type Props = {
  row: Company;
  selected: boolean;
  onEditRow: () => void;
  onViewRow: () => void;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  isPending?: boolean;
};

export function CompanyTableRow({
  row,
  selected,
  onEditRow,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  isPending = false,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [popoverOpen, setPopoverOpen] = useState<HTMLElement | null>(null);

  const approveCompanyMutation = useApproveCompany();
  const rejectCompanyMutation = useRejectCompany();

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPopoverOpen(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setPopoverOpen(null);
  };

  const handleApprove = async () => {
    try {
      await approveCompanyMutation.mutateAsync(row.id);
      console.log('Company approved successfully!');
      setApproveConfirmOpen(false);
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
        companyId: row.id,
        data: { rejectionReason },
      });
      console.log('Company rejected successfully!');
      setRejectDialogOpen(false);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Failed to reject company:', error?.message || error);
    }
  };

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={row.name}
            src={row.logo}
            variant="rounded"
            sx={{ width: 48, height: 48, mr: 2 }}
          >
            {row.name.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" noWrap>
              {row.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Label
                variant="soft"
                color={
                  (row.approvalStatus === 'APPROVED' && 'success') ||
                  (row.approvalStatus === 'PENDING' && 'warning') ||
                  (row.approvalStatus === 'REJECTED' && 'error') ||
                  'default'
                }
              >
                {row.approvalStatus}
              </Label>
            </Box>
          </Box>
        </Box>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.workField}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.location}</TableCell>

      <TableCell>{row.size}</TableCell>

      <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="Quick Edit" placement="top" arrow>
          <IconButton color={popoverOpen ? 'inherit' : 'default'} onClick={handlePopoverOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      <CustomPopover
        open={!!popoverOpen}
        anchorEl={popoverOpen}
        onClose={handlePopoverClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              onViewRow();
              handlePopoverClose();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            View Details
          </MenuItem>

          {isPending && (
            <>
              <MenuItem
                onClick={() => {
                  setApproveConfirmOpen(true);
                  handlePopoverClose();
                }}
                sx={{ color: 'success.main' }}
              >
                <Iconify icon="eva:checkmark-fill" />
                Approve
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setRejectDialogOpen(true);
                  handlePopoverClose();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon="eva:close-fill" />
                Reject
              </MenuItem>
            </>
          )}

          <MenuItem
            onClick={() => {
              onEditRow();
              handlePopoverClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </MenuList>
      </CustomPopover>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        open={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        title="Approve Company"
        content={`Are you sure you want to approve "${row.name}"? This action cannot be undone.`}
        action={
          <LoadingButton
            variant="contained"
            color="success"
            onClick={handleApprove}
            loading={approveCompanyMutation.isPending}
          >
            Approve
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
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to reject "{row.name}"? Please provide a reason for rejection.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please explain why this company is being rejected..."
            helperText="This reason will be sent to the company owner."
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
            Reject
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Company"
        content="Are you sure want to delete this company? This action cannot be undone."
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
