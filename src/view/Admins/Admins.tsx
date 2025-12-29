import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';

import { Iconify } from '@src/components/iconify';
import { Scrollbar } from '@src/components/scrollbar';
import { DashboardContent } from '@src/layouts/dashboard/main';
import { useAdminListing, useBlockUnblockAdminToggle } from '@src/services';
import type { TUser } from '@src/utils/types';
import { getAdminStatus, getEmailInitial, getRoleColor, getRoleDisplayName, getStatusColor } from '@src/utils/adminHelper';
import { onError } from '@src/utils/error';
import { toast } from 'react-toastify';
import { UpdateRole } from './components/UpdateRole';
import { useProfileSelector } from '@src/store/profile/selector';
import { usePagination, usePopOver } from '@src/hooks';
import { formatDate } from '@src/utils/date';
import { AddAdmin } from './components/AddAdmin';
import { ConfirmDialog } from '@src/components/elements';
import { Pagination } from '@src/components/ui';

// ----------------------------------------------------------------------

export const AdminListing = () => {

  const { handleClose, handleOpen, isOpen } = usePopOver()
  const { handleClose: closeAdminRole, handleOpen: openAdminRole, isOpen: isOpenAdminRole } = usePopOver()

  const { handleClose: handleBlockUnblockToggleClose, handleOpen: handleBlockUnblockToggleOpen, isOpen: blockUnblockToggleIsOpen } = usePopOver()

  const { data: adminListing, isLoading, error } = useAdminListing()
  const { mutateAsync: blockUnblockAdminToggle, isPending: toggleLoading } = useBlockUnblockAdminToggle()
  const { userProfile: currentAdmin } = useProfileSelector()
  console.log('currentAdmin: ', currentAdmin)
  const [selectedAdmin, setSelectedAdmin] = useState<TUser>({} as TUser)

  // Safe access to adminListing data
  const safeAdminListing = adminListing?.admins || []

  // Check if the selected admin is the current user
  const isCurrentUser = (admin: TUser) => admin.id === currentAdmin?.id

  // Handle role update with self-check
  const handleRoleUpdate = (admin: TUser) => {
    if (isCurrentUser(admin)) {
      toast.warning('Self role updation is not allowed.')
      return
    }
    setSelectedAdmin(admin)
    openAdminRole()
  }

  // Handle block/unblock toggle with self-check
  const handleBlockUnblockToggle = (admin: TUser) => {
    if (isCurrentUser(admin)) {
      toast.warning('Self status updation is not allowed.')
      return
    }
    setSelectedAdmin(admin)
    handleBlockUnblockToggleOpen()
  }

  // Use the generic pagination hook
  const {
    paginatedData: paginatedAdmins,
    totalItems: totalAdmins,
    totalPages,
    page,
    rowsPerPage,
    rowsPerPageOptions,
    startIndex,
    endIndex,
    setPage,
    setRowsPerPage
  } = usePagination({
    data: safeAdminListing,
    initialPage: 1,
    initialRowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 25, 50]
  })

  const isEmpty = !isLoading && !error && safeAdminListing.length === 0;

  const handleToggleBlock = () => {
    blockUnblockAdminToggle({ id: selectedAdmin.id }, {
      onSuccess: (data) => {
        toast.success(data.message)
        handleBlockUnblockToggleClose()
      },
      onError
    })
  }

  return (
    <DashboardContent>
      <AddAdmin open={isOpen} onClose={handleClose} />
      <UpdateRole onClose={closeAdminRole} editAdminDetails={selectedAdmin} open={isOpenAdminRole} />
      <ConfirmDialog
        title={`${selectedAdmin.isBlocked ? 'Unblock' : 'Block'} Admin`}
        description={`Are you sure to ${selectedAdmin.isBlocked ? 'unblock' : 'block'} this admin?`}
        onClose={handleBlockUnblockToggleClose}
        onConfirm={handleToggleBlock}
        open={blockUnblockToggleIsOpen}
        confirmText={selectedAdmin.isBlocked ? 'Unblock' : 'Block'}
        confirmColor={selectedAdmin.isBlocked ? 'primary' : 'error'}
        isLoading={toggleLoading}
      />

      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Admin Listing
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage system administrators and their permissions
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
            {isLoading
              ? 'Loading administrators…'
              : `Showing ${startIndex + 1} to ${Math.min(endIndex, totalAdmins)} of ${totalAdmins} administrators`}
          </Typography>
        </Box>
        {currentAdmin?.role === 'Super' && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ minWidth: 120 }}
            onClick={handleOpen}
          >
            Add Admin
          </Button>
        )}
      </Box>

      {/* Table Section */}
      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Admin</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell width={200}>Role</TableCell>
                  <TableCell width={120}>Status</TableCell>
                  <TableCell width={160}>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`admin-loading-${index}`}>
                      <TableCell colSpan={5} sx={{ py: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <CircularProgress size={32} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                  : null}

                {error ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Alert
                        severity="error"
                        action={
                          <Button size="small" onClick={() => window.location.reload()}>
                            Retry
                          </Button>
                        }
                      >
                        Failed to load administrators. Please try again.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : null}

                {isEmpty ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box
                        sx={{
                          py: 6,
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          No administrators found
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                          Start by adding your first administrator to manage the system.
                        </Typography>
                        {currentAdmin?.role === 'Super' && (
                          <Button variant="outlined" onClick={handleOpen}>
                            Add Admin
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : null}

                {!isLoading && !error
                  ? paginatedAdmins.map((admin: TUser) => {
                    const status = getAdminStatus(admin.isBlocked)
                    const statusColors = getStatusColor(status)
                    const roleColors = getRoleColor(admin.role)

                    return (
                      <TableRow key={admin.id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'primary.main'
                              }}
                            >
                              {getEmailInitial(admin.email)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {admin.firstName ? `${admin.firstName} ${admin.lastName || ''}` : '----'}
                                {isCurrentUser(admin) && (
                                  <Chip
                                    label="You"
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      height: 20,
                                      fontSize: '10px',
                                    }}
                                    color="primary"
                                  />
                                )}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {admin.email || 'No Email'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getRoleDisplayName(admin.role)}
                            size="small"
                            onDelete={() => handleRoleUpdate(admin)}
                            deleteIcon={<Iconify icon="solar:pen-bold-duotone" />}
                            sx={{
                              backgroundColor: roleColors.bg,
                              color: roleColors.color,
                              border: `1px solid ${roleColors.border}`,
                              fontWeight: 500,
                              '& .MuiChip-deleteIcon': {
                                color: roleColors.color,
                                fontSize: 18,
                                '&:hover': {
                                  color: 'primary.main'
                                }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={admin.isBlocked ? 'Blocked - click to activate' : 'Active - click to block'}>
                            <Switch
                              checked={!admin.isBlocked}
                              onChange={() => handleBlockUnblockToggle(admin)}
                              color="success"
                              disabled={toggleLoading}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formatDate(admin.createdAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })
                  : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      {/* Pagination */}
      {!isEmpty && !isLoading && !error && (
        <Box sx={{ mt: 3 }}>
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalItems={totalAdmins}
            totalPages={totalPages}
            rowsPerPageOptions={rowsPerPageOptions}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            showRowsPerPage={true}
            showPageInfo={true}
            showFirstLastButtons={true}
            size="medium"
            variant="text"
            shape="rounded"
            color="primary"
          />
        </Box>
      )}
    </DashboardContent>
  )
}

