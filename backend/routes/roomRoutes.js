const express = require('express');
const router = express.Router();
const { getRooms, getRoomMessages } = require('../controllers/roomController');

router.get('/', getRooms);
router.get('/:roomId/messages', getRoomMessages);

module.exports = router;
