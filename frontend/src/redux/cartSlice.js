import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { cartApi } from '../api/cartApi'

const EMAIL_STORAGE_KEY = 'honda-store-customer-email'

const loadCustomerEmail = () => {
    if (typeof window === 'undefined') return ''
    try {
        return localStorage.getItem(EMAIL_STORAGE_KEY) || ''
    } catch {
        return ''
    }
}

const saveCustomerEmail = (email) => {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(EMAIL_STORAGE_KEY, email || '')
    } catch {
        /* ignore */
    }
}

function normalizeItemsFromBackend(items) {
    if (!Array.isArray(items)) return []

    return items
        .map((it) => {
            const v = it.vehicle
            if (!v) return null
            return {
                vehicleId: v._id?.toString?.() || v._id,
                name: v.name,
                price: v.price,
                brandName: v.brand?.name || 'Honda',
                manufacture: v.manufacture,
                vehicleModelName: v.vehicleModel?.name,
                vehicleModelId: v.vehicleModel?._id?.toString?.() || v.vehicleModel?._id,
                quantity: it.quantity,
                images: v.images || [],
            }
        })
        .filter(Boolean)
}

export const fetchCartAsync = createAsyncThunk(
    'cart/fetchCart',
    async (customerEmail, { rejectWithValue }) => {
        try {
            const res = await cartApi.getCart(customerEmail)
            if (!res?.success) {
                return rejectWithValue(res?.message || 'Không lấy được giỏ hàng')
            }
            return res.data
        } catch (err) {
            return rejectWithValue(err?.message || 'Lỗi khi lấy giỏ hàng')
        }
    },
)

export const addToCartAsync = createAsyncThunk(
    'cart/addToCart',
    async ({ customerEmail, vehicleId, quantity }, { rejectWithValue }) => {
        try {
            const res = await cartApi.addItem({ customerEmail, vehicleId, quantity })
            if (!res?.success) {
                return rejectWithValue(res?.message || 'Không thêm được vào giỏ hàng')
            }
            return res.data
        } catch (err) {
            return rejectWithValue(err?.message || 'Lỗi khi thêm vào giỏ hàng')
        }
    },
)

export const updateCartQuantityAsync = createAsyncThunk(
    'cart/updateQuantity',
    async ({ customerEmail, vehicleId, quantity }, { rejectWithValue }) => {
        try {
            const res = await cartApi.updateQuantity({ customerEmail, vehicleId, quantity })
            if (!res?.success) {
                return rejectWithValue(res?.message || 'Không cập nhật được số lượng')
            }
            return res.data
        } catch (err) {
            return rejectWithValue(err?.message || 'Lỗi khi cập nhật số lượng')
        }
    },
)

export const removeFromCartAsync = createAsyncThunk(
    'cart/removeItem',
    async ({ customerEmail, vehicleId }, { rejectWithValue }) => {
        try {
            const res = await cartApi.removeItem({ customerEmail, vehicleId })
            if (!res?.success) {
                return rejectWithValue(res?.message || 'Không xóa được sản phẩm')
            }
            return res.data
        } catch (err) {
            return rejectWithValue(err?.message || 'Lỗi khi xóa sản phẩm')
        }
    },
)

export const clearCartAsync = createAsyncThunk(
    'cart/clearCart',
    async (customerEmail, { rejectWithValue }) => {
        try {
            const res = await cartApi.clearCart(customerEmail)
            if (!res?.success) {
                return rejectWithValue(res?.message || 'Không xóa được giỏ hàng')
            }
            return res.data
        } catch (err) {
            return rejectWithValue(err?.message || 'Lỗi khi xóa giỏ hàng')
        }
    },
)

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        customerEmail: loadCustomerEmail(),
        items: [],
        totalItems: 0,
        totalPrice: 0,
        loading: false,
        error: null,
    },
    reducers: {
        setCustomerEmail: (state, action) => {
            state.customerEmail = action.payload || ''
            saveCustomerEmail(state.customerEmail)
        },
    },
    extraReducers: (builder) => {
        const pending = (state) => {
            state.loading = true
            state.error = null
        }

        const rejected = (state, action) => {
            state.loading = false
            state.error = action.payload || action.error?.message || 'Lỗi'
        }

        const fulfilled = (state, action) => {
            state.loading = false
            const data = action.payload || {}
            state.items = normalizeItemsFromBackend(data.items)
            state.totalItems = data.totalItems || 0
            state.totalPrice = data.totalPrice || 0
        }

        builder
            .addCase(fetchCartAsync.pending, pending)
            .addCase(fetchCartAsync.fulfilled, fulfilled)
            .addCase(fetchCartAsync.rejected, rejected)
            .addCase(addToCartAsync.pending, pending)
            .addCase(addToCartAsync.fulfilled, fulfilled)
            .addCase(addToCartAsync.rejected, rejected)
            .addCase(updateCartQuantityAsync.pending, pending)
            .addCase(updateCartQuantityAsync.fulfilled, fulfilled)
            .addCase(updateCartQuantityAsync.rejected, rejected)
            .addCase(removeFromCartAsync.pending, pending)
            .addCase(removeFromCartAsync.fulfilled, fulfilled)
            .addCase(removeFromCartAsync.rejected, rejected)
            .addCase(clearCartAsync.pending, pending)
            .addCase(clearCartAsync.fulfilled, fulfilled)
            .addCase(clearCartAsync.rejected, rejected)
    },
})

export const { setCustomerEmail } = cartSlice.actions

export const selectCustomerEmail = (state) => state.cart.customerEmail
export const selectCartItems = (state) => state.cart.items
export const selectCartTotalQuantity = (state) => state.cart.totalItems
export const selectCartTotalPrice = (state) => state.cart.totalPrice
export const selectCartLoading = (state) => state.cart.loading
export const selectCartError = (state) => state.cart.error

export default cartSlice.reducer