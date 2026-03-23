const Cart = require('../models/Cart')
const User = require('../models/User')
const Vehicle = require('../models/Vehicle')
// Require để Mongoose đăng ký model cho populate nested
require('../models/Brand')
require('../models/VehicleModel')

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '')

async function getCustomerByEmail(customerEmail) {
  const email = normalizeEmail(customerEmail)
  if (!email) return null
  return User.findOne({ email }).lean()
}

async function getCartPopulatedByCustomer(customerId) {
  const cart = await Cart.findOne({ customer: customerId })
    .populate({
      path: 'items.vehicle',
      populate: [
        { path: 'brand', select: 'name' },
        { path: 'vehicleModel', select: 'name engineType fuelType' },
      ],
      select: 'name price manufacture images status brand vehicleModel',
    })
    .lean()

  if (!cart) {
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    }
  }

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = cart.items.reduce((sum, i) => {
    const price = i.vehicle?.price || 0
    return sum + price * i.quantity
  }, 0)

  return {
    items: cart.items,
    totalItems,
    totalPrice,
  }
}

const cartController = {
  // GET /api/cart?customerEmail=
  getCart: async (req, res) => {
    try {
      const customerEmail = req.query.customerEmail
      const customer = await getCustomerByEmail(customerEmail)
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng (email).' })
      }

      const cart = await getCartPopulatedByCustomer(customer._id)
      return res.json({ success: true, data: cart })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  },

  // POST /api/cart/items
  // body: { customerEmail, vehicleId, quantity }
  addCartItem: async (req, res) => {
    try {
      const { customerEmail, vehicleId, quantity } = req.body || {}
      const qty = Number(quantity) || 1
      if (!vehicleId) {
        return res.status(400).json({ success: false, message: 'vehicleId là bắt buộc.' })
      }
      if (qty < 1) {
        return res.status(400).json({ success: false, message: 'quantity phải >= 1.' })
      }

      const customer = await getCustomerByEmail(customerEmail)
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng (email).' })
      }

      const vehicle = await Vehicle.findById(vehicleId).lean()
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy xe.' })
      }

      let cart = await Cart.findOne({ customer: customer._id })
      if (!cart) {
        cart = await Cart.create({ customer: customer._id, items: [], totalItems: 0 })
      }

      const vehicleIdStr = vehicleId.toString()
      const existingItem = cart.items.find((i) => i.vehicle.toString() === vehicleIdStr)

      if (existingItem) {
        existingItem.quantity += qty
      } else {
        cart.items.push({ vehicle: vehicle._id, quantity: qty })
      }

      cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0)
      await cart.save()

      const updatedCart = await getCartPopulatedByCustomer(customer._id)
      return res.json({ success: true, data: updatedCart })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  },

  // PUT /api/cart/items/:vehicleId
  // body: { customerEmail, quantity }
  updateCartItemQuantity: async (req, res) => {
    try {
      const { customerEmail, quantity } = req.body || {}
      const qty = Number(quantity)
      const vehicleId = req.params.vehicleId

      if (!vehicleId) {
        return res.status(400).json({ success: false, message: 'vehicleId là bắt buộc.' })
      }
      if (!Number.isFinite(qty) || qty < 0) {
        return res.status(400).json({ success: false, message: 'quantity không hợp lệ.' })
      }

      const customer = await getCustomerByEmail(customerEmail)
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng (email).' })
      }

      const cart = await Cart.findOne({ customer: customer._id })
      if (!cart) {
        return res.json({ success: true, data: { items: [], totalItems: 0, totalPrice: 0 } })
      }

      const vehicleIdStr = vehicleId.toString()
      const idx = cart.items.findIndex((i) => i.vehicle.toString() === vehicleIdStr)
      if (idx === -1) {
        return res.json({ success: true, data: { items: [], totalItems: 0, totalPrice: 0 } })
      }

      if (qty === 0) {
        cart.items.splice(idx, 1)
      } else {
        cart.items[idx].quantity = qty
      }

      cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0)
      await cart.save()

      const updatedCart = await getCartPopulatedByCustomer(customer._id)
      return res.json({ success: true, data: updatedCart })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  },

  // DELETE /api/cart/items/:vehicleId?customerEmail=
  removeCartItem: async (req, res) => {
    try {
      const { customerEmail } = req.query || {}
      const vehicleId = req.params.vehicleId

      if (!vehicleId) {
        return res.status(400).json({ success: false, message: 'vehicleId là bắt buộc.' })
      }

      const customer = await getCustomerByEmail(customerEmail)
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng (email).' })
      }

      const cart = await Cart.findOne({ customer: customer._id })
      if (!cart) {
        return res.json({ success: true, data: { items: [], totalItems: 0, totalPrice: 0 } })
      }

      const vehicleIdStr = vehicleId.toString()
      cart.items = cart.items.filter((i) => i.vehicle.toString() !== vehicleIdStr)
      cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0)
      await cart.save()

      const updatedCart = await getCartPopulatedByCustomer(customer._id)
      return res.json({ success: true, data: updatedCart })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  },

  // DELETE /api/cart?customerEmail=
  clearCart: async (req, res) => {
    try {
      const customerEmail = req.query.customerEmail
      const customer = await getCustomerByEmail(customerEmail)
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng (email).' })
      }

      const cart = await Cart.findOne({ customer: customer._id })
      if (!cart) {
        return res.json({ success: true, data: { items: [], totalItems: 0, totalPrice: 0 } })
      }

      cart.items = []
      cart.totalItems = 0
      await cart.save()

      const updatedCart = await getCartPopulatedByCustomer(customer._id)
      return res.json({ success: true, data: updatedCart })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  },
}

module.exports = cartController

