import type { PaginationMeta } from 'src/types/common';
import type {
  GridSlots,
  GridColDef,
  DataGridProps,
  GridSortModel,
  GridToolbarProps,
  GridValidRowModel,
  GridPaginationModel,
  ToolbarPropsOverrides,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import { Stack, Typography } from '@mui/material';
import {
  DataGrid,
  gridClasses,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';

import { PAGE_SIZE_OPTIONS } from 'src/types/common';

import { Iconify } from '../iconify';

interface CustomDataGridProps<T extends GridValidRowModel>
  extends Omit<DataGridProps<T>, 'rows' | 'pagination'> {
  data: T[];
  columns: GridColDef<T>[];
  pagination?: PaginationMeta;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  serverSide?: boolean;
  loading?: boolean;
}

const HIDE_COLUMNS = { id: false };

const HIDE_COLUMNS_TOGGLABLE = ['id', 'actions'];

export default function CustomDataGrid<T extends GridValidRowModel>({
  data: rows,
  columns,
  pagination,
  onPaginationChange,
  onSortChange,
  serverSide = false,
  loading = false,
  ...props
}: CustomDataGridProps<T>) {
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  const handlePaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      if (serverSide && onPaginationChange) {
        onPaginationChange(model.page + 1, model.pageSize); // Convert to 1-based page
      }
    },
    [serverSide, onPaginationChange]
  );

  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      if (serverSide && onSortChange && model.length > 0) {
        const sort = model[0];
        onSortChange(sort.field, sort.sort || 'asc');
      }
    },
    [serverSide, onSortChange]
  );

  // Configure pagination for server-side or client-side
  const paginationProps =
    serverSide && pagination
      ? {
          paginationMode: 'server' as const,
          rowCount: pagination.total,
          paginationModel: {
            page: pagination.page - 1, // Convert to 0-based page for DataGrid
            pageSize: pagination.limit,
          },
          onPaginationModelChange: handlePaginationModelChange,
        }
      : {
          paginationMode: 'client' as const,
          initialState: {
            pagination: { paginationModel: { pageSize: 10 } },
          },
        };

  // Configure sorting for server-side or client-side
  const sortingProps = serverSide
    ? {
        sortingMode: 'server' as const,
        onSortModelChange: handleSortModelChange,
      }
    : {
        sortingMode: 'client' as const,
      };

  return (
    <DataGrid
      autoHeight
      disableRowSelectionOnClick
      rows={rows}
      columns={columns}
      loading={loading}
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
      slots={{
        toolbar: CustomToolbar as GridSlots['toolbar'],
        noRowsOverlay: () => (
          <Stack width="100%" height="100%" alignItems="center" justifyContent="center" gap={2}>
            <Iconify icon="material-symbols:database-off-rounded" width={48} height={48} />
            <Typography variant="caption">No data found</Typography>
          </Stack>
        ),
        noResultsOverlay: () => (
          <Stack width="100%" height="100%" alignItems="center" justifyContent="center" gap={2}>
            <Iconify icon="material-symbols:filter-alt-off-rounded" width={48} height={48} />
            <Typography variant="caption">No data found with the current filters</Typography>
          </Stack>
        ),
      }}
      slotProps={{
        panel: { anchorEl: filterButtonEl },
        toolbar: { setFilterButtonEl, showQuickFilter: true } as any,
        columnsManagement: { getTogglableColumns },
      }}
      sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'inline-flex' } }}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      {...paginationProps}
      {...sortingProps}
      disableColumnMenu={!serverSide}
      {...props}
    />
  );
}

// ----------------------------------------------------------------------

interface CustomToolbarProps extends GridToolbarProps, ToolbarPropsOverrides {
  setFilterButtonEl: (el: HTMLButtonElement | null) => void;
}

function CustomToolbar({ setFilterButtonEl }: CustomToolbarProps) {
  return (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton ref={setFilterButtonEl} />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}
