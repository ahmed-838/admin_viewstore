import axios from 'axios';
import { API_BASE_URL } from '../config/Config';

const api = axios.create({
  baseURL: API_BASE_URL
});

// إضافة اعتراض للطلبات لإضافة التوكن
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // إضافة التوكن إلى رأس Authorization
      config.headers['Authorization'] = `Bearer ${token}`;
      // إضافة التوكن أيضًا إلى x-auth-token للتوافق
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 