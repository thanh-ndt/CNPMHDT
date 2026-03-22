import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { vehicleApi } from '../api/vehicleApi'

const FALLBACK_VEHICLES = [
  { _id: '1', name: 'Honda Wave Alpha 110cc 2024', brand: { name: 'Honda' }, vehicleModel: { _id: 'm1', name: 'Wave Alpha', fuelType: 'Xăng' }, manufacture: 2024, price: 18490000, images: [], status: 'available' },
  { _id: '2', name: 'Honda Air Blade 125cc 2024', brand: { name: 'Honda' }, vehicleModel: { _id: 'm2', name: 'Air Blade', fuelType: 'Xăng' }, manufacture: 2024, price: 41190000, images: [], status: 'available' },
  { _id: '3', name: 'Honda Winner X 150cc 2024', brand: { name: 'Honda' }, vehicleModel: { _id: 'm3', name: 'Winner X', fuelType: 'Xăng' }, manufacture: 2024, price: 46190000, images: [], status: 'available' },
  { _id: '4', name: 'Honda Vision 110cc 2024', brand: { name: 'Honda' }, vehicleModel: { _id: 'm4', name: 'Vision', fuelType: 'Xăng' }, manufacture: 2024, price: 26490000, images: [], status: 'available' },
]

const FALLBACK_MODELS = [
  { _id: 'm1', name: 'Wave Alpha' },
  { _id: 'm2', name: 'Air Blade' },
  { _id: 'm3', name: 'Winner X' },
  { _id: 'm4', name: 'Vision' },
]

export const fetchVehicles = createAsyncThunk(
  'vehicle/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const res = await vehicleApi.getVehicles({ brandName: 'Honda', limit: 20 })
      return res?.data || FALLBACK_VEHICLES
    } catch {
      return rejectWithValue(null)
    }
  }
)

const extractModels = (vehicles) => {
  return [...new Map(vehicles.map((v) => [v.vehicleModel?._id || v.vehicleModel?.name, v.vehicleModel])).values()].filter(Boolean)
}

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState: {
    vehicles: [],
    models: [],
    loading: true,
    error: null,
    selectedModel: '',
  },
  reducers: {
    setSelectedModel: (state, action) => {
      state.selectedModel = action.payload || ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false
        state.vehicles = action.payload
        state.models = extractModels(action.payload)
      })
      .addCase(fetchVehicles.rejected, (state) => {
        state.loading = false
        state.vehicles = FALLBACK_VEHICLES
        state.models = FALLBACK_MODELS
      })
  },
})

export const { setSelectedModel } = vehicleSlice.actions

export const selectVehicles = (state) => state.vehicle.vehicles
export const selectModels = (state) => state.vehicle.models
export const selectLoading = (state) => state.vehicle.loading
export const selectSelectedModel = (state) => state.vehicle.selectedModel

export const selectFilteredVehicles = (state) => {
  const { vehicles, selectedModel } = state.vehicle
  if (!selectedModel) return vehicles
  return vehicles.filter((v) => {
    const id = v.vehicleModel?._id?.toString?.() || v.vehicleModel?._id
    const name = v.vehicleModel?.name
    return id === selectedModel || name === selectedModel
  })
}

export default vehicleSlice.reducer
