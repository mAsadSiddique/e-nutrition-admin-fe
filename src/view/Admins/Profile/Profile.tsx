import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    TextField,
    Button,
    // MenuItem,
    // FormControl,
    // InputLabel,
    // Select,
} from "@mui/material";
import { Iconify } from "@src/components/iconify";
import { useGetAdminProfile, useUpdateAdminProfile } from "@src/services";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { onError } from "@src/utils/error";
import type { TAdminProfileUpdate } from "@src/utils/types";

export const Profile = () => {
    const { data: getProfile } = useGetAdminProfile();
    const { mutateAsync: updateProfile, isPending } = useUpdateAdminProfile();

    const validationSchema = Yup.object({
        firstName: Yup.string().required("First name is required"),
        lastName: Yup.string().required("Last name is required"),
        // gender: Yup.string().required("Gender is required"),
        // age: Yup.number()
        //     .min(1, "Age must be at least 1")
        //     .max(120, "Age cannot exceed 120")
        //     .required("Age is required"),
        // phoneNumber: Yup.string()
        //     .matches(/^[+]?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
        //     .required("Phone number is required"),
        // address: Yup.string()
        //     .min(10, "Address must be at least 10 characters")
        //     .required("Address is required"),
    });

    const getRoleDisplayName = (role?: string) => {
        if (role === "Super") return "Super Admin";
        if (role === "Sub") return "Sub Admin";
        return role || "Admin";
    };

    const formik = useFormik<TAdminProfileUpdate>({
        enableReinitialize: true,
        initialValues: {
            firstName: getProfile?.firstName || "",
            lastName: getProfile?.lastName || "",
            email: getProfile?.email || "",
            // gender: getProfile?.gender || "",
            // age: getProfile?.age || 0,
            // phoneNumber: getProfile?.phoneNumber || "",
            // address: getProfile?.address || "",
        },
        validationSchema,
        onSubmit: async (values) => {
            await updateProfile(values, {
                onSuccess: () => {
                    toast.success("Profile updated successfully");
                },
                onError
            });
        },
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Profile Settings
            </Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, textAlign: "center" }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mx: "auto",
                                    mb: 2,
                                    bgcolor: "primary.main",
                                }}
                            >
                                <Iconify icon="solar:user-bold-duotone" width={60} />
                            </Avatar>

                            <Typography variant="h6" sx={{ mb: 1 }}>
                                {formik.values.firstName} {formik.values.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {getRoleDisplayName(getProfile?.role)}
                            </Typography>

                            <Button variant="outlined" fullWidth>
                                Change Photo
                            </Button>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3 }} component="form" onSubmit={formik.handleSubmit}>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                Personal Information
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={formik.values.firstName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.firstName &&
                                            Boolean(formik.errors.firstName)
                                        }
                                        helperText={
                                            formik.touched.firstName && formik.errors.firstName
                                        }
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={formik.values.lastName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                        helperText={formik.touched.lastName && formik.errors.lastName}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        disabled
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formik.values.email}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        disabled
                                        fullWidth
                                        label="Role"
                                        name="role"
                                        value={getRoleDisplayName(getProfile?.role)}
                                    />
                                </Grid>

                                {/* <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Age"
                                        name="age"
                                        type="number"
                                        value={formik.values.age || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            formik.setFieldValue('age', value === '' ? undefined : Number(value));
                                        }}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.age && Boolean(formik.errors.age)}
                                        helperText={formik.touched.age && formik.errors.age}
                                        inputProps={{ min: 1, max: 120 }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        name="phoneNumber"
                                        value={formik.values.phoneNumber}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                                        helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </Grid> */}

                                {/* <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        name="address"
                                        multiline
                                        rows={3}
                                        value={formik.values.address}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.address && Boolean(formik.errors.address)}
                                        helperText={formik.touched.address && formik.errors.address}
                                        placeholder="Enter your full address"
                                    />
                                </Grid> */}
                            </Grid>

                            <Box
                                sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                            >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isPending}
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
        </Box>
    );
};
