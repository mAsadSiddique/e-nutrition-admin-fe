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
    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
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
            spacing={{ xs: 2, sm: 3 }}
            className={className}
            sx={{
                px: { xs: 2, sm: 3 },
                py: 2.5,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                ...sx
            }}
        >
            {/* Left side: Rows per page selector */}
            {showRowsPerPage && (
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.secondary',
                            whiteSpace: 'nowrap',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                        }}
                    >
                        Rows per page
                    </Typography>
                    <FormControl 
                        size="small" 
                        sx={{ 
                            minWidth: 75,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'divider',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                            },
                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                                borderWidth: '1px',
                            }
                        }}
                    >
                        <Select
                            value={rowsPerPage}
                            onChange={handleRowsPerPageChange}
                            sx={{
                                height: 36,
                                '& .MuiSelect-select': {
                                    py: 1,
                                    px: 2,
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                '& .MuiSelect-icon': {
                                    color: 'text.secondary'
                                }
                            }}
                        >
                            {rowsPerPageOptions.map((option) => (
                                <MenuItem 
                                    key={option} 
                                    value={option}
                                    sx={{
                                        fontSize: '0.875rem',
                                        py: 1
                                    }}
                                >
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            )}

            {/* Center: Page info */}
            {showPageInfo && (
                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: 'text.secondary',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                        fontSize: '0.875rem'
                    }}
                >
                    {`${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems}`}
                </Typography>
            )}

            {/* Right side: Pagination controls */}
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
                        minWidth: 36,
                        height: 36,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                            borderColor: 'primary.main',
                        },
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            borderColor: 'primary.main',
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            }
                        },
                        '&.Mui-disabled': {
                            borderColor: 'divider',
                            opacity: 0.5
                        }
                    },
                    '& .MuiPaginationItem-icon': {
                        fontSize: '1.25rem'
                    }
                }}
            />
        </Stack>
    )
} 