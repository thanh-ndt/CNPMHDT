import api from './axiosConfig';

export const registerApi = (data) => api.post('/auth/register', data);
export const verifyEmailApi = (token) => api.get(`/auth/verify-email/${token}`);
export const loginApi = (data) => api.post('/auth/login', data);
export const logoutApi = () => api.post('/auth/logout');
export const forgotPasswordApi = (data) => api.post('/auth/forgot-password', data);
export const resetPasswordApi = (token, data) => api.post(`/auth/reset-password/${token}`, data);
