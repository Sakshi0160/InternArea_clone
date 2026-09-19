const express = require("express");

const router = express.Router();

const adminuser = "admin";
const adminpass = "admin";

router.post("/adminlogin", (req, res) => {
  console.log("========== ADMIN LOGIN ==========");
  console.log("Request body:", req.body);

  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "").trim();

  console.log("Username received:", username);
  console.log("Password received:", password);

  if (username === adminuser && password === adminpass) {
    console.log("Admin login successful");

    return res.status(200).json({
      success: true,
      message: "Admin is here",
    });
  }

  console.log("Invalid admin credentials");

  return res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
});

module.exports = router;