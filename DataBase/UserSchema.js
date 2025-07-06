const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    // required: true,
    // unique: true,
  },
  password: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
    unique: true,
  },
  profileImage: {
    type: Object, // URL to user's profile image
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "",
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", usersSchema);
// const User = mongoose.models.User || mongoose.model('User', usersSchema);

module.exports = User;
