const express = require('express');
const router = express.Router();
const { getOnlineUsers, getOnlineCount, getFriends, sendFriendRequest, acceptFriendRequest } = require('../controllers/userController');

router.get('/online', getOnlineUsers);
router.get('/online-count', getOnlineCount);
router.get('/:userId/friends', getFriends);
router.post('/friend-request', sendFriendRequest);
router.post('/friend-request/accept', acceptFriendRequest);

module.exports = router;
