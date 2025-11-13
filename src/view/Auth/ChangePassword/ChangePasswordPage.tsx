import { Box, Typography } from '@mui/material';
import { ChangePassword } from '@src/components/ChangePassword';
import { DashboardContent } from '@src/layouts/dashboard/main';

export const ChangePasswordPage = () => {
    return (
        <DashboardContent>
            <Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                    Security Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Update your password to keep your account secure
                </Typography>

                <ChangePassword />
            </Box>
        </DashboardContent>
    );
}; 