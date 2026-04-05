import api from './axiosConfig';

export const getProfileApi = () => api.get('/users/profile');
export const updateProfileApi = (data) => api.put('/users/profile', data);
export const changePasswordApi = (data) => api.put('/users/change-password', data);
