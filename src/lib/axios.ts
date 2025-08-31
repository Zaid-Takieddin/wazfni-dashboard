import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { paths } from '../routes/paths';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: 'https://api.wazfni.app/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  },
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  },
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging
    const debugLogs = JSON.parse(localStorage.getItem('authDebugLogs') || '[]');
    debugLogs.push({
      type: 'REQUEST',
      timestamp: new Date().toISOString(),
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
    });
    localStorage.setItem('authDebugLogs', JSON.stringify(debugLogs.slice(-50)));

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Debug logging
    const debugLogs = JSON.parse(localStorage.getItem('authDebugLogs') || '[]');
    debugLogs.push({
      type: 'RESPONSE_SUCCESS',
      timestamp: new Date().toISOString(),
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    localStorage.setItem('authDebugLogs', JSON.stringify(debugLogs.slice(-50)));

    return response;
  },
  (error) => {
    // Debug logging
    const debugLogs = JSON.parse(localStorage.getItem('authDebugLogs') || '[]');
    debugLogs.push({
      type: 'RESPONSE_ERROR',
      timestamp: new Date().toISOString(),
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    localStorage.setItem('authDebugLogs', JSON.stringify(debugLogs.slice(-50)));

    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // Add debug log
      debugLogs.push({
        type: 'AUTH_CLEARED',
        timestamp: new Date().toISOString(),
        reason: '401_ERROR',
      });
      localStorage.setItem('authDebugLogs', JSON.stringify(debugLogs.slice(-50)));

      // Redirect to sign in
      window.location.href = paths.auth.signIn;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/users/profile/me',
    changePassword: '/auth/change-password',
    googleLogin: '/auth/google',
  },
  // Admin endpoints
  admin: {
    approval: {
      companies: {
        pending: '/admin/approval/companies/pending',
        all: '/admin/approval/companies/all',
        details: (id: string) => `/admin/approval/companies/${id}`,
        approve: (id: string) => `/admin/approval/companies/${id}/approve`,
        reject: (id: string) => `/admin/approval/companies/${id}/reject`,
      },
      jobs: {
        pending: '/admin/approval/jobs/pending',
        all: '/admin/approval/jobs/all',
        details: (id: string) => `/admin/approval/jobs/${id}`,
        approve: (id: string) => `/admin/approval/jobs/${id}/approve`,
        reject: (id: string) => `/admin/approval/jobs/${id}/reject`,
      },
    },
  },
  // Other endpoints
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  mail: { list: '/api/mail/list', details: '/api/mail/details', labels: '/api/mail/labels' },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
