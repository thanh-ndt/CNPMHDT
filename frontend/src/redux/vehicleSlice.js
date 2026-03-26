import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../api/axiosConfig'

export const fetchVehicles = createAsyncThunk(
    'vehicle/fetchVehicles',
    async (params, { rejectWithValue }) => {
        try {
            const res = await api.get('/vehicles', { params })
            return res.data
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải danh sách xe')
        }
    },
)

const vehicleSlice = createSlice({
    name: 'vehicle',
    initialState: {
        vehicles: [],
        models: [],
        selectedModel: '',
        loading: false,
        error: null,
    },
    reducers: {
        setSelectedModel: (state, action) => {
            state.selectedModel = action.payload
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
                const data = action.payload
                // Support both { data: [...] } and direct array response
                const list = Array.isArray(data) ? data : (data.data || data.vehicles || [])
                state.vehicles = list

                // Extract unique models from vehicles
                const modelMap = new Map()
                list.forEach((v) => {
                    const m = v.vehicleModel
                    if (m && !modelMap.has(m._id || m.name)) {
                        modelMap.set(m._id || m.name, m)
                    }
                })
                state.models = Array.from(modelMap.values())
            })
            .addCase(fetchVehicles.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Lỗi'
            })
    },
})

export const { setSelectedModel } = vehicleSlice.actions

// Selectors
export const selectVehicles = (state) => state.vehicle.vehicles
export const selectModels = (state) => state.vehicle.models
export const selectLoading = (state) => state.vehicle.loading
export const selectSelectedModel = (state) => state.vehicle.selectedModel
export const selectFilteredVehicles = (state) => {
    const { vehicles, selectedModel } = state.vehicle
    if (!selectedModel) return vehicles
    return vehicles.filter(
        (v) => (v.vehicleModel?._id || v.vehicleModel?.name) === selectedModel,
    )
}

export default vehicleSlice.reducer
