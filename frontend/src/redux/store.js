import { configureStore } from '@reduxjs/toolkit';
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
    compare: compareReducer,
  },
});

export default store;
