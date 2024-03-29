const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { encrypt } = require("../utils/crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
    validate: {
      validator: (username) => /^[a-zA-Z0-9_]+$/.test(username),
    },
  },
  name: {
    type: String,
    minlength: 1,
    maxlength: 50,
    validate: {
      validator: (name) => /^[a-zA-Z0-9_]+$/.test(name),
    },
  },
  personalInfo: {
    type: String,
    minlength: 1,
    maxlength: 2000,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 60,
  },

});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
