const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên xe là bắt buộc'],
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Thương hiệu là bắt buộc'],
    },
    vehicleModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VehicleModel',
      required: [true, 'Dòng xe là bắt buộc'],
    },
    manufacture: {
      type: Number,
    },
    price: {
      type: Number,
      required: [true, 'Giá xe là bắt buộc'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'out_of_stock', 'discontinued'],
      default: 'available',
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
