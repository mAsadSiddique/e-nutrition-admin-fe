import React from 'react'
import {
    Stack,
    Typography,
    Pagination as MuiPagination,
    Select,
    MenuItem,
    FormControl,
    useTheme,
    useMediaQuery
} from '@mui/material'

type TPaginationProps = {
    // Pagination state
    page: number
    rowsPerPage: number
    totalItems: number
    totalPages: number
    rowsPerPageOptions: number[]

    // Pagination info
    startIndex: number
    endIndex: number

    // Actions
    onPageChange: (page: number) => void
    onRowsPerPageChange: (rowsPerPage: number) => void

    // Optional props
    showRowsPerPage?: boolean
    showPageInfo?: boolean
    showFirstLastButtons?: boolean
    size?: 'small' | 'medium' | 'large'
    variant?: 'text' | 'outlined'
    shape?: 'circular' | 'rounded'
    color?: 'primary' | 'secondary' | 'standard'
    className?: string
    sx?: any
}

export const Pagination: React.FC<TPaginationProps> = ({
    page,
    rowsPerPage,
    totalItems,
    totalPages,
    rowsPerPageOptions,
    startIndex,
    endIndex,
    onPageChange,
    onRowsPerPageChange,
    showRowsPerPage = true,
    showPageInfo = true,
    showFirstLastButtons = true,
    size = 'medium',
    variant = 'text',
    shape = 'rounded',
    color = 'primary',
    className,
    sx
}) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    // Handle page change
    const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
        onPageChange(newPage)
    }

    // Handle rows per page change
    const handleRowsPerPageChange = (event: any) => {
        onRowsPerPageChange(parseInt(event.target.value, 10))
    }

    // Don't render if no items
    if (totalItems === 0) {
        return null
    }

    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            className={className}
            sx={{
                mt: 2,
                p: 2,
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                ...sx
            }}
        >
            {/* Rows per page selector */}
            {showRowsPerPage && (
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                        Rows per page:
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                        <Select
                            value={rowsPerPage}
                            onChange={handleRowsPerPageChange}
                            sx={{
                                '& .MuiSelect-select': {
                                    py: 1,
                                    px: 2,
                                    fontSize: '14px'
                                }
                            }}
                        >
                            {rowsPerPageOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            )}

            {/* Page info */}
            {showPageInfo && (
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                    {`${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} items`}
                </Typography>
            )}

            {/* Pagination controls */}
            <MuiPagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color={color}
                variant={variant}
                shape={shape}
                size={isMobile ? "small" : size}
                showFirstButton={showFirstLastButtons}
                showLastButton={showFirstLastButtons}
                sx={{
                    '& .MuiPaginationItem-root': {
                        borderRadius: '8px',
                        fontWeight: 500,
                        '&.Mui-selected': {
                            backgroundColor: '#1A5BEE',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#1A5BEEB2',
                            }
                        }
                    }
                }}
            />
        </Stack>
    )
} 