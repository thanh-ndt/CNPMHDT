import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import addressReducer from './addressSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        address: addressReducer,
    },
});

export default store;
