const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/rooms', chatController.getChatRooms);
router.get('/messages/:roomId', chatController.getRoomMessages);
router.get('/customer-room/:customerId', chatController.getCustomerRoomInfo);

module.exports = router;
