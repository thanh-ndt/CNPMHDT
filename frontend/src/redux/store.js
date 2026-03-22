import { configureStore } from '@reduxjs/toolkit';
import compareReducer from './compareSlice';

export const store = configureStore({
  reducer: {
    compare: compareReducer,
  },
});
