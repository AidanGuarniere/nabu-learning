const mongoose = require("mongoose");

const chatPreferencesSchema = new mongoose.Schema({
  mode: {
    type: String,
    required: true,
    enum: ["Tutor Session", "Note Generation", "Flashcard Generation"],
  },
  selectedModel: {
    type: String,
    required: true,
    enum: ["gpt-3.5-turbo", "gpt-4"],
  },
  topic: {
    type: String,
    maxlength: 500,
  },
  keyConcepts: {
    type: [String],
    validate: [arrayLimit, "{PATH} exceeds the limit of 10 items"],
  },
  priorKnowledge: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  learningStyle: {
    type: String,
    enum: ["Visual", "Auditory", "Kinesthetic", "Reading/Writing"],
  },
  challenges: {
    type: [String],
    validate: [arrayLimit, "{PATH} exceeds the limit of 5 items"],
  },
  timeFrame: {
    type: String,
    required: true,
  },
  goal: {
    type: String,
    maxlength: 500,
    required: true,
  },
  tutorType: {
    type: String,
    enum: ["Traditional", "Socratic"],
  },
  tutorName: {
    type: String,
    maxlength: 50,
  },
  tutorBehavior: {
    type: String,
    maxlength: 50,
  },
  noteType: {
    type: String,
    enum: ["Summary", "Cornell", "Outline"],
  },
  noteTitle: {
    type: String,
    maxlength: 100,
  },
  noteTone: {
    type: String,
    maxlength: 100,
  },
  flashcardDifficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
  },
  additionalInfo: {
    type: String,
    maxlength: 1500,
  },
});

function arrayLimit(val) {
  return val.length <= 10;
}

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
