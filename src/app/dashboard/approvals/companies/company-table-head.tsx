import type { TableHeadCustomProps } from 'src/components/table';

import { TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------

type Props = TableHeadCustomProps;

export function CompanyTableHead({ ...other }: Props) {
  return <TableHeadCustom {...other} />;
}
