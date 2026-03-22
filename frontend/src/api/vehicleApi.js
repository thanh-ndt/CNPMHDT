import axiosClient from './axios';

export const vehicleApi = {
  getVehicles: (params) => axiosClient.get('/vehicles', { params }),
  getVehiclesByIds: (ids) => axiosClient.get('/vehicles', { params: { ids: ids.join(',') } }),
  favoriteVehicle: (id) => axiosClient.patch(`/vehicles/${id}/favorite`),
};
