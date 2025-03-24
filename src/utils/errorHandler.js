import { showErrorNotification } from './notifications';

export const handleApiError = (error, operation) => {
  console.error(`خطأ في ${operation}:`, error);
  
  if (error.response) {
    // الخادم استجاب برمز حالة خارج نطاق 2xx
    if (error.response.status === 401) {
      showErrorNotification('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      // تسجيل الخروج وإعادة التوجيه إلى صفحة تسجيل الدخول
      localStorage.removeItem('token');
      window.location.href = '/router/login';
      return;
    }
    
    showErrorNotification(`فشل في ${operation}: ${error.response.data.message || 'حدث خطأ ما'}`);
  } else if (error.request) {
    // لم يتم استلام استجابة
    showErrorNotification(`فشل في ${operation}: لا يمكن الاتصال بالخادم`);
  } else {
    // حدث خطأ أثناء إعداد الطلب
    showErrorNotification(`فشل في ${operation}: ${error.message}`);
  }
}; 