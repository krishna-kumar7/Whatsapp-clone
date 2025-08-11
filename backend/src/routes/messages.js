const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get all chats grouped by user
router.get('/chats', messageController.getChats);

// Get messages for a user
router.get('/chats/:wa_id/messages', messageController.getMessages);

// Send/store a new message
router.post('/chats/:wa_id/messages', (req, res) => messageController.sendMessage(req, res));

module.exports = router;
