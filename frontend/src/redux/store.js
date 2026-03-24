import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import addressReducer from './addressSlice';
import cartReducer from './cartSlice';
import vehicleReducer from './vehicleSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        address: addressReducer,
        cart: cartReducer,
        vehicle: vehicleReducer,
    },
});

export { store };
export default store;
