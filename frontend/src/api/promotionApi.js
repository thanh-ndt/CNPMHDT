import api from './axiosConfig';

export const getActivePromotionsApi = async () => {
    const response = await api.get('/promotions/active');
    return response.data;
};

export const validatePromotionApi = async (data) => {
    const response = await api.post('/promotions/validate', data);
    return response.data;
};
