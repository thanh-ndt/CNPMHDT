const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// GET /api/vehicles/suggestions
router.get('/suggestions', vehicleController.getSuggestions);

// GET /api/vehicles
router.get('/', vehicleController.getVehicles);

// GET /api/vehicles/:id (phải đặt dưới các đường dẫn cố định như /suggestions)
router.get('/:id', vehicleController.getVehicleById);

// PATCH /api/vehicles/:id/favorite
router.patch('/:id/favorite', vehicleController.toggleFavorite);

module.exports = router;
