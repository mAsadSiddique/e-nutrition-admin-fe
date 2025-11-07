// components/ConfirmDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    description?: string;
    onClose: () => void;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'primary' | 'error' | 'warning' | 'success';
    isLoading?: boolean;
}

export const ConfirmDialog = ({
    open,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    onClose,
    onConfirm,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    confirmColor = 'primary',
    isLoading = false
}: ConfirmDialogProps) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1, pr: 6 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant='h6' sx={{ fontWeight: 600, color: '#1A1A1A' }}>
                        {title}
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: '#666666'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ pb: 2 }}>
                <Typography variant="body1" sx={{ color: '#666666', lineHeight: 1.6 }}>
                    {description}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
                <Button 
                    variant='outlined' 
                    onClick={onClose} 
                    color="inherit"
                    sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 3
                    }}
                    disabled={isLoading}
                >
                    {cancelText}
                </Button>
                <Button 
                    onClick={onConfirm} 
                    color={confirmColor} 
                    variant="contained"
                    sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 3
                    }}
                    disabled={isLoading}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
