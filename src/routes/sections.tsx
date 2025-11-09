import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from '@src/theme/styles';
import { AuthLayout } from '@src/layouts/auth';
import { DashboardLayout } from '@src/layouts/dashboard';
import storage from '@src/utils/storage';

// ----------------------------------------------------------------------

const Login = lazy(() => import('@src/view').then(module => ({ default: module.SignInView })));
const ForgotPassword = lazy(() =>
  import('@src/view/Auth/ForgotPassword/ForgotPassword').then((module) => ({
    default: module.ForgotPasswordView,
  }))
);
const SetPassword = lazy(() =>
  import('@src/view/Auth/SetPassword/SetPassword').then((module) => ({
    default: module.SetPasswordView,
  }))
);
const Admins = lazy(() => import('@src/view').then(module => ({ default: module.AdminListing })));
const Categories = lazy(() => import('@src/view').then(module => ({ default: module.Categories })));
const Blogging = lazy(() => import('@src/view').then(module => ({ default: module.Blogging })));
const BlogCreateView = lazy(() => import('@src/view').then(module => ({ default: module.BlogCreateView })));

// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const token = storage.getToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Public Route Component
function PublicRoute({ children }: { children: React.ReactElement }) {
  return children;
}

// Root Redirect Component
function RootRedirect() {
  return <Navigate to="/" replace />;
}

export function Router() {
  return useRoutes([
    {
      element: (
        <PublicRoute>
          <AuthLayout>
            <Suspense fallback={renderFallback}>
              <Outlet />
            </Suspense>
          </AuthLayout>
        </PublicRoute>
      ),
      children: [
        {
          path: '/',
          element: <Login />
        },
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/forgot-password',
          element: <ForgotPassword />
        },
        {
          path: '/set-password',
          element: <SetPassword />
        },
      ],
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Suspense fallback={renderFallback}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Admins />,
        },
        {
          path: 'admins',
          element: <Admins />,
        },
        {
          path: 'categories',
          element: <Categories />,
        },
        {
          path: 'blogging',
          element: <Blogging />,
        },
        {
          path: 'blogging/create',
          element: <BlogCreateView />,
        },
      ],
    },
    {
      path: '*',
      element: <RootRedirect />,
    },
  ]);
}
