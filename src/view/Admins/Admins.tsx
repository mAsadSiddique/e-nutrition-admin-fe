import {
  Button,
  Container,
  Stack,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material'
// import { useAdminListing, useBlockUnblockAdminToggle } from '@src/services'
import React, { useState } from 'react'
import { Iconify } from '@src/components/iconify'
import type { TUser } from '@src/utils/types'

// import { usePagination, usePopOver } from '@src/hooks'


import { Switch } from '@mui/material'

import { getAdminStatus, getEmailInitial, getRoleColor, getRoleDisplayName, getStatusColor } from '@src/utils/adminHelper'
import { onError } from '@src/utils/error'
import { toast } from 'react-toastify'
import { styled } from '@mui/material/styles';
import { UpdateRole } from './components/UpdateRole'
import { useProfileSelector } from '@src/store/profile/selector'
import { usePagination, usePopOver } from '@src/hooks'
import { useAdminListing, useBlockUnblockAdminToggle } from '@src/services'
import { formatDate } from '@src/utils/date'
import { AddAdmin } from './components/AddAdmin'
import { ConfirmDialog } from '@src/components/elements'
import { Pagination } from '@src/components/ui'

// Gradient button component with specified colors
export const GradientButton = ({ children, ...props }: any) => (
  <Button
    {...props}
    sx={{
      background: 'linear-gradient(135deg, #1A5BEE 0%, #1A5BEEB2 50%, rgba(26, 91, 238, 0.7) 100%)',
      // border: '2px solid',
      borderImage: 'linear-gradient(135deg, #1D9CEE 0%, #1D9CEEB2 50%, rgba(29, 156, 238, 0.7) 100%) 1',
      borderRadius: '12px',
      color: 'white',
      fontWeight: 600,
      textTransform: 'none',
      fontSize: { xs: '12px', sm: '14px' },
      px: { xs: 2, sm: 3 },
      py: { xs: 1, sm: 1.5 },
      boxShadow: '0 4px 12px rgba(26, 91, 238, 0.3)',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'linear-gradient(135deg, #1A5BEEB2 0%, rgba(26, 91, 238, 0.8) 50%, #1A5BEE 100%)',
        borderImage: 'linear-gradient(135deg, #1D9CEEB2 0%, rgba(29, 156, 238, 0.8) 50%, #1D9CEE 100%) 1',
        boxShadow: '0 6px 20px rgba(26, 91, 238, 0.4)',
        // transform: 'translateY(-2px)',
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: '0 2px 8px rgba(26, 91, 238, 0.3)',
      },
      ...props.sx
    }}
  >
    {children}
  </Button>
)

export const AdminListing = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const { handleClose, handleOpen, isOpen } = usePopOver()
  const { handleClose: closeAdminRole, handleOpen: openAdminRole, isOpen: isOpenAdminRole } = usePopOver()

  const { handleClose: handleBlockUnblockToggleClose, handleOpen: handleBlockUnblockToggleOpen, isOpen: blockUnblockToggleIsOpen } = usePopOver()

  const { data: adminListing, isLoading, error } = useAdminListing()
  const { mutateAsync: blockUnblockAdminToggle, isPending: toggleLoading } = useBlockUnblockAdminToggle()
  const { userProfile: currentAdmin } = useProfileSelector()

  const [selectedAdmin, setSelectedAdmin] = useState<TUser>({} as TUser)

  // Safe access to adminListing data
  const safeAdminListing = adminListing?.admins || []

  // Check if the selected admin is the current user
  const isCurrentUser = (admin: TUser) => admin._id === currentAdmin?._id

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

  // Mobile card view component
  const MobileAdminCard = ({ admin }: { admin: TUser }) => {
    const status = getAdminStatus(admin.isBlocked)
    const statusColors = getStatusColor(status)
    const roleColors = getRoleColor(admin.role)

    return (
      <Paper sx={{
        p: 2,
        mb: 2,
        borderRadius: '12px',
        border: '1px solid #E5E7EB'
      }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                width: 50,
                height: 50,
                bgcolor: '#1A5BEE'
              }}
            >
              {getEmailInitial(admin.email)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {admin.email || 'No Email'}
                {isCurrentUser(admin) && (
                  <Chip
                    label="You"
                    size="small"
                    sx={{
                      ml: 1,
                      backgroundColor: '#1A5BEE',
                      color: 'white',
                      fontSize: '10px',
                      height: '20px'
                    }}
                  />
                )}
              </Typography>
              <Chip
                label={getRoleDisplayName(admin.role)}
                size="small"
                sx={{
                  backgroundColor: roleColors.bg,
                  color: roleColors.color,
                  border: `1px solid ${roleColors.border}`,
                  fontWeight: 500,
                  fontSize: '11px'
                }}
              />
            </Box>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip
              label={status}
              size="small"
              sx={{
                backgroundColor: statusColors.bg,
                color: statusColors.color,
                border: `1px solid ${statusColors.border}`,
                fontWeight: 500,
                fontSize: '11px'
              }}
            />
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Joined: {formatDate(admin.createdAt)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton
              size="small"
              onClick={() => handleRoleUpdate(admin)}
              sx={{
                color: '#1A5BEE',
                '&:hover': { backgroundColor: 'rgba(26, 91, 238, 0.1)' }
              }}
            >
              <Iconify icon="solar:pen-bold-duotone" />
            </IconButton>
            <Tooltip title={admin.isBlocked ? 'Blocked - click to activate' : 'Active - click to block'}>
              <IconButton
                size="small"
                onClick={() => handleBlockUnblockToggle(admin)}
                sx={{
                  color: admin.isBlocked ? '#10B981' : '#FF5630',
                  '&:hover': {
                    backgroundColor: admin.isBlocked
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(255, 86, 48, 0.1)'
                  }
                }}
              >
                <Iconify icon={admin.isBlocked ? "solar:lock-unlock-bold-duotone" : "solar:lock-bold-duotone"} />
              </IconButton>
            </Tooltip>
          </Stack>
          {isCurrentUser(admin) && (
            <Typography
              variant="caption"
              sx={{
                textAlign: 'center',
                color: '#6B7280',
                fontStyle: 'italic',
                backgroundColor: '#F3F4F6',
                py: 0.5,
                px: 1,
                borderRadius: '4px'
              }}
            >
              Current User
            </Typography>
          )}
        </Stack>
      </Paper>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <Container sx={{
        maxWidth: '1200px',
        background: '#FFFFFF',
        borderRadius: { xs: '12px', md: '16px' },
        padding: { xs: 1.5, sm: 2, md: 3 },
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        mt: { xs: 1, md: 2 }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  // Error state
  if (error) {
    return (
      <Container sx={{
        maxWidth: '1200px',
        background: '#FFFFFF',
        borderRadius: { xs: '12px', md: '16px' },
        padding: { xs: 1.5, sm: 2, md: 3 },
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        mt: { xs: 1, md: 2 }
      }}>
        <Alert severity="error">
          Failed to load admin data. Please try again later.
        </Alert>
      </Container>
    )
  }

  // No data state
  if (!adminListing || !adminListing.admins || adminListing.admins.length === 0) {
    return (
      <Container sx={{
        maxWidth: '1200px',
        background: '#FFFFFF',
        borderRadius: { xs: '12px', md: '16px' },
        padding: { xs: 1.5, sm: 2, md: 3 },
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        mt: { xs: 1, md: 2 }
      }}
      >
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{
              justifyContent: 'space-between',
              gap: { xs: 2, sm: 0 }
            }}
          >
            <Box>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  fontWeight: 700,
                  color: '#1A1A1A',
                  mb: 0.5,
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                Admin Listing
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#666666',
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                Manage system administrators and their permissions
              </Typography>
            </Box>

            {
              currentAdmin?.role === 'Super' && <GradientButton
                startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                fullWidth={isMobile}
              >
                Add Admin
              </GradientButton>
            }

          </Stack>

          <Alert severity="info">
            No admin users found. Add your first admin user to get started.
          </Alert>
        </Stack>
      </Container>
    )
  }

  const handleToggleBlock = () => {
    blockUnblockAdminToggle({ id: selectedAdmin._id }, {
      onSuccess: (data) => {
        toast.success(data.message)
        handleBlockUnblockToggleClose()
      },
      onError
    })
  }


  return (
    <Container sx={{
      maxWidth: '90%',
      background: '#FFFFFF',
      borderRadius: { xs: '12px', md: '16px' },
      padding: { xs: 1.5, sm: 2, md: 3 },
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      mt: { xs: 1, md: 2 }
    }}>
      <Stack spacing={{ xs: 2, md: 3 }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{
            justifyContent: 'space-between',
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 700,
                color: '#1A1A1A',
                mb: 0.5,
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Admin Listing
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666666',
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Manage system administrators and their permissions
            </Typography>
          </Box>

          {
            currentAdmin?.role === 'Super' &&
            <GradientButton
              startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
              fullWidth={isMobile}
              onClick={handleOpen}
            >
              Add Admin
            </GradientButton>
          }

          {/* modal for add admin... */}
          <AddAdmin open={isOpen} onClose={handleClose} />

          <ConfirmDialog
            title={`${selectedAdmin.isBlocked ? 'Unblock' : 'Block'} Admin`}
            description={`Are you sure to ${selectedAdmin.isBlocked ? 'unblock' : 'block'} this admin?`}
            onClose={handleBlockUnblockToggleClose}
            onConfirm={handleToggleBlock}
            open={blockUnblockToggleIsOpen}
            confirmText={selectedAdmin.isBlocked ? 'Unblock' : 'Block'}
          />

          <UpdateRole onClose={closeAdminRole} editAdminDetails={selectedAdmin} open={isOpenAdminRole} />


        </Stack>

        {/* Admin Table/Cards */}
        {isMobile ? (
          // Mobile card view
          <Box>
            {paginatedAdmins.map((admin: TUser) => (
              <MobileAdminCard key={admin._id} admin={admin} />
            ))}
          </Box>
        ) : (
          // Desktop table view
          <Paper sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableCell sx={{
                      fontWeight: 600,
                      color: '#374151',
                      fontSize: { sm: '14px', md: '16px' },
                      py: { sm: 1.5, md: 2 }
                    }}>
                      Admin
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: 600,
                      color: '#374151',
                      fontSize: { sm: '14px', md: '16px' },
                      py: { sm: 1.5, md: 2 }
                    }}>
                      Email
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: 600,
                      color: '#374151',
                      fontSize: { sm: '14px', md: '16px' },
                      py: { sm: 1.5, md: 2 }
                    }}>
                      Role
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: 600,
                      color: '#374151',
                      fontSize: { sm: '14px', md: '16px' },
                      py: { sm: 1.5, md: 2 }
                    }}>
                      Status
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: 600,
                      color: '#374151',
                      fontSize: { sm: '14px', md: '16px' },
                      py: { sm: 1.5, md: 2 }
                    }}>
                      Joined
                    </TableCell>
                    {/* <TableCell sx={{
                                            fontWeight: 600,
                                            color: '#374151',
                                            fontSize: { sm: '14px', md: '16px' },
                                            py: { sm: 1.5, md: 2 }
                                        }}>
                                            Actions
                                        </TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAdmins.map((admin: TUser) => {
                    const status = getAdminStatus(admin.isBlocked)
                    const statusColors = getStatusColor(status)
                    const roleColors = getRoleColor(admin.role)

                    return (
                      <TableRow key={admin._id} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                        <TableCell sx={{ py: { sm: 1.5, md: 2 } }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              sx={{
                                width: { sm: 35, md: 40 },
                                height: { sm: 35, md: 40 },
                                bgcolor: '#1A5BEE'
                              }}
                            >
                              {/* {getEmailInitial(admin.email)} */}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: { sm: '13px', md: '14px' }
                                }}
                              >
                                {admin.firstName ? `${admin.firstName} ${admin.lastName || ''}` : '----'}
                                {isCurrentUser(admin) && (
                                  <Chip
                                    label="You"
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      backgroundColor: '#1A5BEE',
                                      color: 'white',
                                      fontSize: '10px',
                                      height: '20px'
                                    }}
                                  />
                                )}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: { sm: 1.5, md: 2 } }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#374151',
                              fontSize: { sm: '13px', md: '14px' }
                            }}
                          >
                            {admin.email || 'No Email'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: { sm: 1.5, md: 2 } }}>
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
                              fontSize: { sm: '11px', md: '12px' },
                              '& .MuiChip-deleteIcon': {
                                color: roleColors.color,
                                fontSize: 18,
                                '&:hover': {
                                  color: '#1A5BEE'
                                }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: { sm: 1.5, md: 2 } }}>
                          <Tooltip title={admin.isBlocked ? 'Blocked - click to activate' : 'Active - click to block'}>
                            <Switch
                              checked={!admin.isBlocked}
                              onChange={() => handleBlockUnblockToggle(admin)}
                              color="success"
                              disabled={toggleLoading}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ py: { sm: 1.5, md: 2 } }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#6B7280',
                              fontSize: { sm: '13px', md: '14px' }
                            }}
                          >
                            {formatDate(admin.createdAt)}
                          </Typography>
                        </TableCell>
                        {/* TODO: WILL REMOVE THIS... */}
                        {/* <TableCell sx={{ py: { sm: 1.5, md: 2 } }}>
                                                    <Stack direction="row" spacing={1}>
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                color: '#FF5630',
                                                                '&:hover': { backgroundColor: 'rgba(255, 86, 48, 0.1)' }
                                                            }}
                                                        >
                                                            <Iconify icon="solar:trash-bin-trash-bold-duotone" />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell> */}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Pagination */}
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
      </Stack>
    </Container>
  )
}

