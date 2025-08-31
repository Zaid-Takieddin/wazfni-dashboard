'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function ApprovalsPage() {
  const router = useRouter();

  const approvalCards = [
    {
      title: 'Company Approvals',
      description: 'Review and approve company registrations',
      icon: 'solar:buildings-2-bold',
      color: 'primary',
      path: paths.dashboard.approvals.companies.pending,
      stats: {
        pending: 0, // TODO: Fetch from API
        total: 0,
      },
    },
    {
      title: 'Job Approvals',
      description: 'Review and approve job postings',
      icon: 'solar:case-round-bold',
      color: 'secondary',
      path: paths.dashboard.approvals.jobs.pending,
      stats: {
        pending: 0, // TODO: Fetch from API
        total: 0,
      },
    },
  ];

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Approvals"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Approvals' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        {approvalCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardActionArea onClick={() => router.push(card.path)}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${card.color}.lighter`,
                        color: `${card.color}.main`,
                        mr: 2,
                      }}
                    >
                      <Iconify icon={card.icon} width={32} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {card.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color={`${card.color}.main`}>
                        {card.stats.pending}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pending
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">{card.stats.total}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </DashboardContent>
  );
}
