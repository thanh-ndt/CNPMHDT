const express = require('express');
const router = express.Router();
const vehicleModelController = require('../controllers/VehicleModelController');

// GET /api/vehicle-models
router.get('/', vehicleModelController.getAllModels);

// GET /api/vehicle-models/stats
router.get('/stats', vehicleModelController.getModelStats);

// POST /api/vehicle-models
router.post('/', vehicleModelController.createModel);

// PUT /api/vehicle-models/:id
router.put('/:id', vehicleModelController.updateModel);

// DELETE /api/vehicle-models/:id
router.delete('/:id', vehicleModelController.deleteModel);

module.exports = router;
