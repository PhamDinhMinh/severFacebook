const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  described: {
    type: String,
    required: false,
  },

  images: [String],
  videos: [String],
  like: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  countComments: {
    type: Number,
    required: false,
    default: 0,
  },
  isLike: {
    type: Boolean,
    required: false,
    default: false,
  },
});
postsSchema.set("timestamps", true);
module.exports = mongoose.model("Posts", postsSchema);
