import { configureStore } from '@reduxjs/toolkit';
import addressReducer from './addressSlice';

export const store = configureStore({
  reducer: {
    address: addressReducer,
    // Thêm các reducers khác ở đây (userAuth, products, v.v...)
  },
});
