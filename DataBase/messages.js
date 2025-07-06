const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recepientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  messageType: {
    type: String,
    enum: ["text", "image"],
  },
  message: {
    type: String,
  },
  imageUrl: {
      type: Object, // URL to user's profile image
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: { type: Boolean, default: false }, // 👈 New field
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;