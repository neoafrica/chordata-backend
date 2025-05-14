const mongoose = require("mongoose");

const TweetSchema = new mongoose.Schema({
  text: String,
  imageUrl: String,
});

const ThreadSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tweets: [TweetSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Thread", ThreadSchema);
