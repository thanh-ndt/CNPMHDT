import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const cartApi = {
  getCart: (customerEmail) =>
    axios
      .get(`${API_URL}/cart`, {
        params: { customerEmail },
      })
      .then((res) => res.data),

  addItem: ({ customerEmail, vehicleId, quantity }) =>
    axios
      .post(`${API_URL}/cart/items`, { customerEmail, vehicleId, quantity })
      .then((res) => res.data),

  updateQuantity: ({ customerEmail, vehicleId, quantity }) =>
    axios
      .put(`${API_URL}/cart/items/${vehicleId}`, { customerEmail, quantity })
      .then((res) => res.data),

  removeItem: ({ customerEmail, vehicleId }) =>
    axios
      .delete(`${API_URL}/cart/items/${vehicleId}`, {
        params: { customerEmail },
      })
      .then((res) => res.data),

  clearCart: (customerEmail) =>
    axios
      .delete(`${API_URL}/cart`, {
        params: { customerEmail },
      })
      .then((res) => res.data),
}

