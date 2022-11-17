import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
// components
import Iconify from '../components/iconify';
// sections
import {
  AppNewsUpdate,
  AppCurrentVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppWebsiteVisits,
  
} from '../sections/@dashboard/app';

  const updatesList = [
    {
      id: "1",
      description: "New Real Estate Collection Listed",
    },
     {
      id: "2",
      description: "Albany Crowdsale has ended",
    },
     {
      id: "3",
      description: "2023 Gensis Crowdsale is about to begin",
    },
     {
      id: "4",
      description: "lol",
    },
     {
      id: "5",
      description: "I ran out of Ideas",
    },
  ]

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();
  console.log(faker.date.recent())
    console.log(updatesList)


  return (
    <>
      <Helmet>
        <title> Dashboard | Minimal UI </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hello,
        </Typography>

        <Grid container spacing={3}>
           <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="New NFTs Added" total={70} color="info" icon={'ant-design:apple-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Weekly fNFT Sales" total={15000} icon={'ant-design:android-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Your fNFTs" total={5} color="success" icon={'logos:ethereum'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="My Investments(eth)" total={2.20} icon={'icon-park:seven-key'} />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppWebsiteVisits
              title="My Investments"
              subheader="(+5%) from last quarter"
              chartLabels={[
                '01/01/2022',
                '02/01/2022',
                '03/01/2022',
                '04/01/2022',
                '05/01/2022',
                '06/01/2022',
                '07/01/2022',
                '08/01/2022',
                '09/01/2022',
                '10/01/2022',
                '11/01/2022',
              ]}
              chartData={[
                {
                  name: 'Real Estate',
                  type: 'line',
                  fill: 'solid',
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 50, 52],
                  color: theme.palette.primary.main,
                },
                {
                  name: 'Traditional Art',
                  type: 'line',
                  fill: 'solid',
                  data: [44, 55, 41, 67, 45, 43, 47, 41, 56, 53, 54],
                  color: theme.palette.error.main
                },
                {
                  name: 'Automobiles',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 33, 33, 30, 28, 20],
                  color: theme.palette.success.main
                },
              ]}
              
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Portfolio Allocation"
              chartData={[
                { label: 'Real Estate', value: 27500 },
                { label: 'Traditional Art', value: 3439 },
                { label: 'Automobiles', value: 3439 },

              ]}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.error.main,
                theme.palette.success.main

              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppNewsUpdate
              title="Updates"
              list={updatesList.map((update, index) => ({
                id: update.id,
                description: update.description,
                image: `/assets/images/covers/cover_${index + 1}.jpg`,
                postedAt: faker.date.recent(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppTrafficBySite
              title="Traffic by Site"
              list={[
                {
                  name: 'Twitter',
                  icon: <Iconify icon={'eva:twitter-fill'} color="#1C9CEA" width={32} />,
                },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
