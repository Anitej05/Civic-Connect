import axios from 'axios';

// 1. Create and EXPORT the new Axios instance.
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// 2. Add a request interceptor to automatically include the auth token.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Define the authentication service functions.
export const authService = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await apiClient.post('/auth/login', formData);
    return response.data;
  },

  signup: async (email, password) => {
    const response = await apiClient.post('/auth/signup', { email, password });
    return response.data;
  },
};

// 4. Define the report service for citizen-facing actions.
export const reportService = {
  getNearby: async (lat, lon) => {
    const response = await apiClient.get('/reports/nearby', { params: { lat, lon } });
    return response.data;
  },

  getMyReports: async () => {
    const response = await apiClient.get('/reports/my-reports');
    return response.data;
  },

  smartCreate: async (formData) => {
    const response = await apiClient.post('/reports/smart-create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// 5. Define the admin service for admin-only actions.
export const adminService = {
  getReports: async (department) => {
    const params = department ? { department } : {};
    const response = await apiClient.get('/admin/reports', { params });
    return response.data;
  },

  updateStatus: async (reportId, status) => {
    const response = await apiClient.patch(`/admin/reports/${reportId}`, { status });
    return response.data;
  },
};
