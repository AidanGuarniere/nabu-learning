const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["system", "user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const functionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 1,
      trim: true,
    },
    parameters: {
      type: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
      },
      properties: {
        type: Map,
        of: {
          type: {
            type: String,
            required: true,
            minlength: 1,
            trim: true,
          },
          description: {
            type: String,
            required: true,
            minlength: 1,
            trim: true,
          },
        },
      },
      required: [
        {
          type: String,
          minlength: 1,
          trim: true,
        },
      ],
    },
  },
  { _id: false }
);

const messageLimit = (val) => {
  return val.length <= 100;
};

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  messages: {
    type: [messageSchema],
    validate: [messageLimit, "chat exceeds message limit"],
  },
  functions: { type: [functionSchema] },
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

module.exports = { Chat, chatSchema };
