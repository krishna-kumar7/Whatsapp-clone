const Message = require('../models/Message');

// Process incoming payload (for webhook or script)
exports.processPayload = async (payload, io) => {
  let result;
  if (payload.type === 'message') {
    const msg = new Message({
      wa_id: payload.wa_id,
      name: payload.name,
      number: payload.number,
      message: payload.message,
      status: 'sent',
      timestamp: payload.timestamp ? new Date(payload.timestamp) : Date.now(),
      meta_msg_id: payload.meta_msg_id,
      raw: payload,
    });
    result = await msg.save();
    if (io) io.emit('new_message', result);
    return result;
  } else if (payload.type === 'status') {
    const filter = payload.id
      ? { _id: payload.id }
      : { meta_msg_id: payload.meta_msg_id };
    result = await Message.findOneAndUpdate(
      filter,
      { status: payload.status },
      { new: true }
    );
    if (io && result) io.emit('status_update', result);
    return result;
  }
};

// Get all chats grouped by wa_id
exports.getChats = async (req, res) => {
  const chats = await Message.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: {
      _id: '$wa_id',
      name: { $first: '$name' },
      number: { $first: '$number' },
      lastMessage: { $first: '$message' },
      lastStatus: { $first: '$status' },
      lastTimestamp: { $first: '$timestamp' },
    }},
    { $sort: { lastTimestamp: -1 } }
  ]);
  res.json(chats);
};

// Get messages for a user (wa_id)
exports.getMessages = async (req, res) => {
  const { wa_id } = req.params;
  const messages = await Message.find({ wa_id }).sort({ timestamp: 1 });
  res.json(messages);
};

// Send/store a new message
exports.sendMessage = async (req, res) => {
  const { wa_id, name, number, message } = req.body;
  const msg = new Message({
    wa_id,
    name,
    number,
    message,
    status: 'sent',
    timestamp: Date.now(),
  });
  await msg.save();
  if (req.io) req.io.emit('new_message', msg);
  res.status(201).json(msg);
};
