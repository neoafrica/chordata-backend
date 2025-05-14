const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    // required:true
  },
  body: {
    type: String,
    // required:true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("stories", storySchema);
