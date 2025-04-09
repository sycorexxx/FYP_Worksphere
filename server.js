require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const authenticateUser = require("./middlewares/authenticateUser");
const router = require("./routes/account");

const app = express();

// Middleware
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend origin if needed
    credentials: true, // Allow credentials (cookies)
  })
);
// Assuming your CSS is in the 'public' folder
app.use("/", require("./routes/account"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Ensure views path is correct

// Routes
app.use("/", require("./routes/account"));
app.use("/api/auth", authRoutes);
router.get("/accountCreation", authenticateUser, (req, res) => {
  res.render("accountCreation");
});
app.get("/signup", (req, res) => res.render("signup"));
app.get("/login", (req, res) => res.render("login"));

// Role-based Dashboard Routing
app.get("/dashboard", authenticateUser, (req, res) => {
  if (req.user.role === "client") {
    return res.redirect("/client-dashboard");
  } else if (req.user.role === "freelancer") {
    return res.redirect("/freelancer-dashboard");
  } else {
    return res.status(403).json({ message: "Access denied" });
  }
});

app.get("/client-dashboard", authenticateUser, (req, res) => {
  if (req.user.role !== "client") {
    return res.status(403).json({ message: "Access denied" });
  }
  res.render("client-dashboard", { user: req.user });
});

app.get("/freelancer-dashboard", authenticateUser, (req, res) => {
  if (req.user.role !== "freelancer") {
    return res.status(403).json({ message: "Access denied" });
  }
  res.render("freelancer-dashboard", { user: req.user });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log("MongoDB connection error:", err));
