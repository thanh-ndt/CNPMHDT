import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// URL API backend (điều chỉnh cho phù hợp với môi trường thực tế)
const API_URL = 'http://localhost:5000/api/addresses';

// Async thunk để gọi API lưu địa chỉ
export const addAddress = createAsyncThunk(
  'address/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, addressData, {
        withCredentials: true // để gửi cookie/session nếu có auth
      });
      return response.data;
    } catch (error) {
       // Trả về message lỗi từ server hoặc lỗi mặc định
      return rejectWithValue(
        error.response && error.response.data.message 
          ? error.response.data.message 
          : error.message
      );
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    addresses: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    // Reset state success/error nếu cần
    resetAddressState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Thêm địa chỉ mới vào danh sách
        if (action.payload.data) {
          state.addresses.push(action.payload.data);
        }
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { resetAddressState } = addressSlice.actions;

export default addressSlice.reducer;
