const express = require("express");
const router = express.Router();
const User = require("../Model/User");

// =====================================
// Get Login History
// =====================================
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("loginHistory");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const history = [...(user.loginHistory || [])].reverse();

    return res.status(200).json({
      success: true,
      loginHistory: history,
    });

  } catch (error) {
    console.error("LOGIN HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;