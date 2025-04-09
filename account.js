const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateUser = require("../middlewares/authenticateUser");
const multer = require("multer");
const path = require("path");

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Show form for finishing account setup
router.get("/accountCreation", authenticateUser, (req, res) => {
  res.render("accountCreation");
});

// Handle form submission with file upload
router.post(
  "/accountCreation",
  authenticateUser,
  upload.single("profilePicture"),
  async (req, res) => {
    console.log("✅ POST /accountCreation route hit");
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);
    console.log("Authenticated user:", req.user);

    const {
      bio,
      skills,
      isMentor,
      address,
      phone,
      securityQuestion,
      securityAnswer,
    } = req.body;

    try {
      if (!req.user || !req.user._id) {
        console.error("❌ No authenticated user found in request");
        return res.status(401).send("Unauthorized");
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        const user = await User.findById(req.user.userId);
        return res.status(404).send("User not found");
      }

      const profilePicturePath = req.file
        ? "/uploads/" + req.file.filename
        : user.profilePicture || null;

      // Only update if field is provided
      if (bio) user.bio = bio;
      if (skills) user.skills = skills.split(",").map((skill) => skill.trim());
      user.isMentor = isMentor === "on";
      if (address) user.address = address;
      if (phone) user.phone = phone;
      if (securityQuestion) user.securityQuestion = securityQuestion;
      if (securityAnswer) user.securityAnswer = securityAnswer;
      user.profilePicture = profilePicturePath;

      await user.save();
      console.log("✅ User profile updated:", user);

      res.redirect(`/${user.role}-dashboard`);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      res.status(500).send("Error updating profile");
    }
  }
);

module.exports = router;
