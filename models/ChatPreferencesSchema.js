const mongoose = require('mongoose');

const chatPreferencesSchema = new mongoose.Schema({
  selectedModel: {
    type: String,
    required: [true, 'Model selection is required'],
    enum: ['gpt-3.5-turbo', 'gpt-4'], // Add more models as needed
  },
  tutorType: {
    type: String,
    required: [true, 'Tutor type is required'],
    enum: ['Socratic', 'Traditional', 'Test Prep', 'Interactive'], // Add more tutoring styles as needed
  },
  tutorBehavior: {
    type: String,
    required: [true, 'Tutor behavior is required'],
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
  },
  goal: {
    type: String,
    required: [true, 'Specific goal is required'],
  },
  personalInfo: {
    type: String, // Define this based on the expected structure of personal information
  },
});

const ChatPreferences = mongoose.model('ChatPreferences', chatPreferencesSchema);

module.exports = ChatPreferences;
