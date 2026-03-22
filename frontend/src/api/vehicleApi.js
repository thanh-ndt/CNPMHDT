import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const vehicleApi = {
  getVehicles: (params = {}) =>
    axios.get(`${API_URL}/vehicles`, { params }).then((res) => res.data),
  getVehicleById: (id) =>
    axios.get(`${API_URL}/vehicles/${id}`).then((res) => res.data),
}

export const brandApi = {
  getBrands: () => axios.get(`${API_URL}/brands`).then((res) => res.data),
}
