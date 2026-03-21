const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// GET /api/vehicles/suggestions
router.get('/suggestions', vehicleController.getSuggestions);

// GET /api/vehicles
router.get('/', vehicleController.getVehicles);

// PATCH /api/vehicles/:id/favorite
router.patch('/:id/favorite', vehicleController.toggleFavorite);

module.exports = router;
