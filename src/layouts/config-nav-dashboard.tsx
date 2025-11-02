import { Label } from 'src/components/label';
import { SvgColor } from '@src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Categories',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Blogging',
    path: '/dashboard/blogging',
    icon: icon('ic-blog'),
  },
];
