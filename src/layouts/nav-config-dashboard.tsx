import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  approval: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [{ title: 'App', path: paths.dashboard.root, icon: ICONS.dashboard }],
  },
  /**
   * Approvals
   */
  {
    subheader: 'Approvals',
    items: [
      {
        title: 'Company Approvals',
        path: paths.dashboard.approvals.companies.root,
        icon: ICONS.ecommerce,
        children: [
          { title: 'Pending Companies', path: paths.dashboard.approvals.companies.pending },
          { title: 'All Companies', path: paths.dashboard.approvals.companies.all },
        ],
      },
      {
        title: 'Job Approvals',
        path: paths.dashboard.approvals.jobs.root,
        icon: ICONS.job,
        children: [
          { title: 'Pending Jobs', path: paths.dashboard.approvals.jobs.pending },
          { title: 'All Jobs', path: paths.dashboard.approvals.jobs.all },
        ],
      },
    ],
  },
  /**
   * Management
   */
  {
    subheader: 'Management',
    items: [
      {
        title: 'Categories',
        path: paths.dashboard.categories,
        icon: ICONS.folder,
      },
      {
        title: 'Users',
        path: paths.dashboard.users,
        icon: ICONS.user,
      },
    ],
  },
];
