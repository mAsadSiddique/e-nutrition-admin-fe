import { SvgColor } from '@src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Admins',
    path: '/dashboard/admins',
    icon: icon('Admin'),
  },
  {
    title: 'Categories',
    path: '/dashboard',
    icon: icon('Home'),
  },
  {
    title: 'Blogging',
    path: '/dashboard/blogging',
    icon: icon('Content'),
  },
];
