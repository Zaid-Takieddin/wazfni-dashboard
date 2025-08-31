'use client';

import { useState } from 'react';

import { Box, Tab, Card, Tabs, Button } from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CategoryListTable } from '../category-list-table';
import { CategoryCreateDialog } from '../category-create-dialog';
import { SubcategoryListTable } from '../subcategory-list-table';
import { SubcategoryCreateDialog } from '../subcategory-create-dialog';

// ----------------------------------------------------------------------

export function CategoryManagementView() {
  const settings = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('categories');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleTabChange}>
      <Tab
        label="Categories"
        value="categories"
        icon={<Iconify icon="solar:folder-bold" />}
        iconPosition="start"
      />
      <Tab
        label="Subcategories"
        value="subcategories"
        icon={<Iconify icon="solar:folder-2-bold" />}
        iconPosition="start"
      />
    </Tabs>
  );

  const renderActions = (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {currentTab === 'categories' && (
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setCategoryDialogOpen(true)}
        >
          Add Category
        </Button>
      )}
      {currentTab === 'subcategories' && (
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setSubcategoryDialogOpen(true)}
        >
          Add Subcategory
        </Button>
      )}
    </Box>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Category Management"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Categories' }]}
        action={renderActions}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        {renderTabs}
      </Box>

      <Card>
        {currentTab === 'categories' && <CategoryListTable />}
        {currentTab === 'subcategories' && <SubcategoryListTable />}
      </Card>

      {/* Dialogs */}
      <CategoryCreateDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
      />

      <SubcategoryCreateDialog
        open={subcategoryDialogOpen}
        onClose={() => setSubcategoryDialogOpen(false)}
      />
    </DashboardContent>
  );
}
