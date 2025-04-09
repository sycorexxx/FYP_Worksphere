const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: false },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["client", "freelancer"], // Restrict role to either client or freelancer
    required: true,
  },
  profilePicture: { type: String }, // Store the URL or filename of the uploaded profile picture
  address: { type: String }, // Store the address
  phone: { type: String }, // Store the phone number (optional)
  securityQuestion: { type: String }, // Store the security question chosen by the user
  securityAnswer: { type: String }, // Store the user's answer to the security question
  skills: [String], // Array of skills the user adds
  isMentor: { type: Boolean, default: false },
  assignedMentor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bio: { type: String },
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      message: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  feedback: [
    {
      from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: Number,
      comment: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
