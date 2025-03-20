import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Dashboard, People, Settings, Article, Notifications, Help } from '@mui/icons-material';
import LogoutButton from './LogoutButton';

const UpperHomeSquare = () => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <LogoutButton />
        <Typography variant="h4" component="h1" gutterBottom align="right" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          دليل استخدام لوحة التحكم
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="body1" paragraph align="right">
        مرحباً بك في لوحة تحكم الإدارة. هذا الدليل سيساعدك على فهم كيفية استخدام الميزات المختلفة المتاحة لك كمسؤول.
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText 
              primary={<Typography variant="h6" align="right">لوحة المعلومات</Typography>}
              secondary={<Typography variant="body2" align="right" component="span">استخدمها لإدارة المنتجات و العروض و تحديث الاسعار و التحكم بكل منتج مكان تشاء .</Typography>}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <People />
            </ListItemIcon>
            <ListItemText 
              primary={<Typography variant="h6" align="right"> سرية البيانات</Typography>}
              secondary={<Typography variant="body2" align="right" component="span"> لا تشارك بيانات تسجيل الدخول مع احد في هي تتيح للمستخدم التحكم الكامل بالمنتجات و لا يمكن تحديثها بسهولة .</Typography>}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Article />
            </ListItemIcon>
            <ListItemText 
              primary={<Typography variant="h6" align="right">إدارة المحتوى</Typography>}
              secondary={<Typography variant="body2" align="right" component="span">اهتم  بمنتجاتك و ضيف المزيد من العروض و  ربنا يكرم  ان شاء الله </Typography>}
            />
          </ListItem>
          
          {/* <ListItem>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText 
              primary={<Typography variant="h6" align="right">الإعدادات</Typography>}
              secondary={<Typography variant="body2" align="right" component="span">تخصيص إعدادات الموقع، بما في ذلك المظهر والوظائف.</Typography>}
            />
          </ListItem> */}
        </List>
      </Box>
      
      <Box sx={{ mt: 4, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
        <Typography variant="h6" align="right" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Help sx={{ mr: 1 }} /> نصائح مهمة
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary={<Typography variant="body2" align="right" component="span">تأكد من تسجيل الخروج عند الانتهاء من استخدام لوحة التحكم.</Typography>} />
          </ListItem>
          <ListItem>
            <ListItemText primary={<Typography variant="body2" align="right" component="span">قم بمراجعة التغييرات قبل النشر النهائي.</Typography>} />
          </ListItem>
          <ListItem>
            <ListItemText primary={<Typography variant="body2" align="right" component="span">للمساعدة، يمكنك الاتصال بفريق الدعم الفني عبر قسم المساعدة اللي هو انا يعني 😂 "01224900205"</Typography>} />
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
};

export default UpperHomeSquare;
