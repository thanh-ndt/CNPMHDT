const express = require('express');
const router = express.Router();
const { createAppointment, getAppointmentsByCustomerId } = require('../controllers/appointmentController');

router.post('/', createAppointment);
router.get('/customer/:customerId', getAppointmentsByCustomerId);

module.exports = router;
