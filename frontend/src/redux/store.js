import { configureStore } from '@reduxjs/toolkit'
import vehicleReducer from './vehicleSlice'
import cartReducer from './cartSlice'

export const store = configureStore({
  reducer: {
    vehicle: vehicleReducer,
    cart: cartReducer,
  },
})
