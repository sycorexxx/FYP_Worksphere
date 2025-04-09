// authenticateUser.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user; // 🔁 this makes req.user a full Mongoose user document
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};
