import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'honda-store-cart'

function loadItemsFromStorage() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveItemsToStorage(items) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadItemsFromStorage(),
  },
  reducers: {
    addToCart: (state, action) => {
      const { vehicle, quantity = 1 } = action.payload
      const id = vehicle._id?.toString?.() || vehicle._id
      const existing = state.items.find((i) => i.vehicleId === id)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({
          vehicleId: id,
          name: vehicle.name,
          price: vehicle.price,
          brandName: vehicle.brand?.name || 'Honda',
          manufacture: vehicle.manufacture,
          vehicleModelName: vehicle.vehicleModel?.name,
          quantity,
        })
      }
      saveItemsToStorage(state.items)
    },
    removeFromCart: (state, action) => {
      const id = action.payload
      state.items = state.items.filter((i) => i.vehicleId !== id)
      saveItemsToStorage(state.items)
    },
    updateQuantity: (state, action) => {
      const { vehicleId, quantity } = action.payload
      const item = state.items.find((i) => i.vehicleId === vehicleId)
      if (item) {
        if (quantity < 1) {
          state.items = state.items.filter((i) => i.vehicleId !== vehicleId)
        } else {
          item.quantity = quantity
        }
      }
      saveItemsToStorage(state.items)
    },
    clearCart: (state) => {
      state.items = []
      saveItemsToStorage(state.items)
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectCartTotalQuantity = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0)
export const selectCartTotalPrice = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

export default cartSlice.reducer
