const mongoose = require("mongoose");

const chatPreferencesSchema = new mongoose.Schema({
  mode: {
    type: String,
    required: [true, "Mode selection is required"],
    enum: ["Discussion", "Note Generation", "Flashcard Generation"],
  },
  selectedModel: {
    type: String,
    required: [true, "Model selection is required"],
    enum: ["gpt-3.5-turbo", "gpt-4"], 
  },
  topic: {
    type: String,
    required: [true, "Topic is required"],
  },
  keyConcepts: {
    type: [String],
  },
  priorKnowledge: {
    type: String,
  },
  learningStyle: {
    type: String,
  },
  // challenges: {
  //   type: [String],
  // },
  timeFrame: {
    type: String,
  },
  goal: {
    type: String,
    required: [true, "Specific goal is required"],
  },
  personalInfo: {
    type: String, 
  },
  tutorType: {
    type: String,
  },
  tutorName: {
    type: String,
  },
  tutorBehavior: {
    type: String,
  },
  noteType: {
    type: String,
  },
  noteTitle: {
    type: String,
  },
  noteTone: {
    type: String,
  },
  flashcardCount: {
    type: String,
  },
  flashcardDifficulty: {
    type: String,
  },
});

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["system", "user", "assistant"],
    required: true,
  },
  content: {
    type: String,
  },
  function_call: {
    type: {
      name: { type: String, required: true },
      arguments: { type: Object, required: true }, // Change this line
    },
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
  chatPreferences: chatPreferencesSchema,
  messages: {
    type: [messageSchema],
    validate: [messageLimit, "chat exceeds message limit"],
  },
  functions: { type: [functionSchema] },
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

module.exports = { Chat, chatSchema };
