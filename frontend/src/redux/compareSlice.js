import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  compareIds: [],
  isCompareMode: false,
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    toggleCompare: (state, action) => {
      // action.payload: { id, image }
      const payload = typeof action.payload === 'object' ? action.payload : { id: action.payload };
      const existingIndex = state.compareIds.findIndex(item => item.id === payload.id || item === payload.id);

      if (existingIndex >= 0) {
        state.compareIds.splice(existingIndex, 1);
      } else if (state.compareIds.length < 3) {
        state.compareIds.push({ id: payload.id, image: payload.image });
      }
    },
    resetCompare: (state) => {
      state.compareIds = [];
      state.isCompareMode = false;
    },
    setIsCompareMode: (state, action) => {
      state.isCompareMode = action.payload;
    },
    setCompareIds: (state, action) => {
      // if passing primitive ids, wrap them in objects
      state.compareIds = action.payload.map(id => typeof id === 'object' ? id : { id });
    },
    removeCompareId: (state, action) => {
      state.compareIds = state.compareIds.filter(item => (item.id || item) !== action.payload);
    }
  },
});

export const { toggleCompare, resetCompare, setIsCompareMode, setCompareIds, removeCompareId } = compareSlice.actions;
export default compareSlice.reducer;
