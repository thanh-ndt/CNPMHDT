import { configureStore } from '@reduxjs/toolkit';
import addressReducer from './addressSlice';
import authReducer from './authSlice';
import addressReducer from './addressSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        address: addressReducer,
    },
import compareReducer from './compareSlice';

export const store = configureStore({
  reducer: {
    address: addressReducer,
    // Thêm các reducers khác ở đây (userAuth, products, v.v...)
  },
});

export default store;
