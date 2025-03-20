"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Grid, Typography, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const buttonStyle = {
  height: '120px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
  }
};

const HomeButtons = () => {
  const router = useRouter();
  
  const navigateTo = (path) => {
    router.push(path);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom style={{ marginBottom: '30px' }}>
        إدارة المتجر
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
            <Button
              variant="contained"
              color="primary"
              sx={buttonStyle}
              fullWidth
              onClick={() => navigateTo('/router/add-product')}
            >
              <AddIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1">إضافة منتج جديد</Typography>
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
            <Button
              variant="contained"
              color="secondary"
              sx={buttonStyle}
              fullWidth
              onClick={() => navigateTo('/router/edit-product')}
            >
              <EditIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1">تعديل أو حذف منتج</Typography>
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
            <Button
              variant="contained"
              color="success"
              sx={buttonStyle}
              fullWidth
              onClick={() => navigateTo('/router/add-offer')}
            >
              <LocalOfferIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1">إضافة عرض جديد</Typography>
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
            <Button
              variant="contained"
              color="error"
              sx={buttonStyle}
              fullWidth
              onClick={() => navigateTo('/router/edit-offer')}
            >
              <DeleteSweepIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1">تعديل أو حذف عرض</Typography>
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default HomeButtons;
