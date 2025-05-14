const mongoose = require("mongoose");

const StoryBillboardSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      // required:true
    },
    Image: {
      type: Object, // URL to user's profile image
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("storyBillboard", StoryBillboardSchema);