const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Model/User");
// const LoginHistory = require("../Model/LoginHistory");
const transporter = require("../config/mailer");
const getLoginInfo = require("../Utils/loginInfo");
const useragent = require("express-useragent");

function isMobileLoginAllowed() {
  const now = new Date();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const startMinutes = 10 * 60;
  const endMinutes = 13 * 60;

  return (
    currentMinutes >= startMinutes &&
    currentMinutes < endMinutes
  );
}

// =============================
// Detect Login Environment
// =============================
function getLoginEnvironment(req) {
  const userAgent = req.headers["user-agent"] || "";

  let browser = "Unknown";
  let operatingSystem = "Unknown";
  let deviceType = "unknown";

  // =============================
  // Browser
  // =============================
  if (/Edg/i.test(userAgent)) {
    browser = "Microsoft Edge";
  } else if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) {
    browser = "Google Chrome";
  } else if (/Firefox/i.test(userAgent)) {
    browser = "Mozilla Firefox";
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = "Safari";
  } else if (/OPR/i.test(userAgent)) {
    browser = "Opera";
  }

  // =============================
  // Operating System
  // =============================
  if (/Windows NT/i.test(userAgent)) {
    operatingSystem = "Windows";
  } else if (/Android/i.test(userAgent)) {
    operatingSystem = "Android";
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    operatingSystem = "iOS";
  } else if (/Mac OS X/i.test(userAgent)) {
    operatingSystem = "macOS";
  } else if (/Linux/i.test(userAgent)) {
    operatingSystem = "Linux";
  }

  // =============================
  // Device Type
  // =============================
  if (/iPhone|Android.*Mobile|Windows Phone/i.test(userAgent)) {
    deviceType = "mobile";
  } else if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
    deviceType = "tablet";
  } else if (/Windows|Macintosh|Linux/i.test(userAgent)) {
    deviceType = "desktop";
  }

  // =============================
  // IP Address
  // =============================
  let ipAddress =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "";

  if (typeof ipAddress === "string" && ipAddress.includes(",")) {
    ipAddress = ipAddress.split(",")[0].trim();
  }

  if (ipAddress === "::1") {
    ipAddress = "127.0.0.1";
  }

  return {
    browser,
    operatingSystem,
    deviceType,
    ipAddress,
  };
}

// =============================
// Password Generator
// =============================
function generatePassword(length = 8) {
  const letters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += letters.charAt(
      Math.floor(Math.random() * letters.length)
    );
  }

  return password;
}

// =============================
// Register
// =============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // ==============================
    // Validate required fields
    // ==============================
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Remove accidental spaces
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // ==============================
    // Check EMAIL separately
    // ==============================
    const emailExists = await User.findOne({
      email: cleanEmail,
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // ==============================
    // Check PHONE separately
    // ==============================
    const phoneExists = await User.findOne({
      phone: cleanPhone,
    });

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // ==============================
    // Hash password
    // ==============================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ==============================
    // Create user
    // ==============================
    const user = new User({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      photo: "",
      googleId: "",
      loginType: "email",
      friends: [],
      friendRequests: [],
      savedPosts: [],
    });

    await user.save();

    // ==============================
    // Success
    // ==============================
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    // MongoDB duplicate key protection
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "email") {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      if (duplicateField === "phone") {
        return res.status(400).json({
          success: false,
          message: "Phone number already registered",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =============================
// Login
// =============================
router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.trim().toLowerCase() },
        { phone: emailOrPhone.trim() },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =============================
    // Detect Login Information
    // =============================
    const loginInfo = getLoginInfo(req);

    console.log("LOGIN INFO:", loginInfo);

    // =============================
    // Mobile Login Restriction
    // =============================
    if (
      loginInfo.deviceType === "mobile" &&
      !isMobileLoginAllowed()
    ) {
      user.loginHistory.push({
        ...loginInfo,
        loginMethod: "email",
        status: "blocked",
        loginAt: new Date(),
      });

      await user.save();

      return res.status(403).json({
        success: false,
        message:
          "Mobile login is allowed only between 10:00 AM and 1:00 PM.",
      });
    }

    // =============================
    // Check Password
    // =============================
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    // =============================
    // Failed Login
    // =============================
    if (!isMatch) {
      user.loginHistory.push({
        ...loginInfo,
        loginMethod: "email",
        status: "failed",
        loginAt: new Date(),
      });

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

   // =========================
// Chrome Login → OTP Required
// =========================
if (loginInfo.browser === "Google Chrome") {

  const otp = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Save OTP
  user.loginOtp = otp;
  user.loginOtpExpires = new Date(
    Date.now() + 5 * 60 * 1000
  );

  // Save login attempt as OTP pending
  user.loginHistory.push({
    ...loginInfo,
    loginMethod: "email",
    status: "otp_pending",
    loginAt: new Date(),
  });

  await user.save();

  console.log("===== EMAIL LOGIN OTP =====");
  console.log("Email:", user.email);
  console.log("Generated OTP:", otp);
  console.log("Stored OTP:", user.loginOtp);
  console.log("Expires:", user.loginOtpExpires);

  // Send OTP
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "InternArea Login OTP",
    html: `
      <h2>Login Verification</h2>

      <p>Hello <strong>${user.name}</strong>,</p>

      <p>A login was detected from Google Chrome.</p>

      <p>Your OTP is:</p>

      <h1>${otp}</h1>

      <p>This OTP will expire in 5 minutes.</p>

      <p>If you did not try to log in, please secure your account.</p>
    `,
  });

  console.log(
    "Chrome OTP sent to:",
    user.email
  );

  return res.json({
    success: true,
    otpRequired: true,
    message: "OTP sent to your registered email",
    email: user.email,
  });
}

// =========================
// Non-Chrome Login
// =========================
user.loginHistory.push({
  ...loginInfo,
  loginMethod: "email",
  status: "success",
  loginAt: new Date(),
});

await user.save();

console.log(
  "LOGIN HISTORY SAVED:",
  user.loginHistory
);

// =========================
// Generate JWT
// =========================
const token = jwt.sign(
  { id: user._id },
  "internarea-secret-key",
  {
    expiresIn: "7d",
  }
);

return res.json({
  success: true,
  otpRequired: false,
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    photo: user.photo,
  },
});

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
// =============================
// Verify Login OTP
// =============================
router.post("/verify-login-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // =============================
    // Find User
    // =============================
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =============================
    // Check OTP
    // =============================
    if (!user.loginOtp) {
      return res.status(400).json({
        success: false,
        message: "No login OTP found. Please login again.",
      });
    }
console.log("===== OTP VERIFICATION =====");
console.log("Email received:", email);
console.log("OTP received:", otp);
console.log("OTP stored in DB:", user.loginOtp);
console.log("OTP expiry:", user.loginOtpExpires);
    if (user.loginOtp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "wrong OTP entered",
      });
    }

    // =============================
    // Check OTP Expiry
    // =============================
    if (
      !user.loginOtpExpires ||
      new Date() > new Date(user.loginOtpExpires)
    ) {
      user.loginOtp = "";
      user.loginOtpExpires = null;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please login again.",
      });
    }

    // =============================
    // OTP Correct
    // =============================

    // Clear OTP
    user.loginOtp = "";
    user.loginOtpExpires = null;

    // =============================
    // Find Latest Pending Login
    // =============================
    for (let i = user.loginHistory.length - 1; i >= 0; i--) {
      if (
        user.loginHistory[i].status === "otp_pending"
      ) {
        user.loginHistory[i].status = "success";
        break;
      }
    }

    await user.save();

    // =============================
    // Generate JWT
    // =============================
    const token = jwt.sign(
      { id: user._id },
      "internarea-secret-key",
      {
        expiresIn: "7d",
      }
    );

    // =============================
    // Response
    // =============================
    return res.status(200).json({
      success: true,
      message: "OTP verified. Login successful.",
      token,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo,
      },
    });

  } catch (error) {
    console.error(
      "VERIFY LOGIN OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =============================
// Forgot Password
// =============================
router.post("/forgot-password", async (req, res) => {
  try {
    const { value, newPassword } = req.body;

    if (!value || !newPassword) {
  return res.status(400).json({
    success: false,
    message: "All fields are required",
  });
}

    const user = await User.findOne({
      $or: [
        { email: value },
        { phone: value },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.lastPasswordReset) {
      const last = new Date(user.lastPasswordReset);
      const today = new Date();

      if (
        last.getDate() === today.getDate() &&
        last.getMonth() === today.getMonth() &&
        last.getFullYear() === today.getFullYear()
      ) {
        return res.status(400).json({
          success: false,
          message: "You can use this option only once per day.",
        });
      }
    }

// const newPassword = generatePassword(8);
const hashedPassword = await bcrypt.hash(newPassword, 10);

user.password = hashedPassword;
user.lastPasswordReset = new Date();

await user.save();

// // Send email
// await transporter.sendMail({
//   from: process.env.EMAIL_USER,
//   to: user.email,
//   subject: "Password Reset",
//   html: `
//     <h2>Password Reset Successful</h2>

//     <p>Hello <strong>${user.name}</strong>,</p>

//     <p>Your password has been reset successfully.</p>

//     <p><strong>New Password:</strong> ${newPassword}</p>

//     <p>Please log in using this password and change it immediately from your account settings.</p>

//     <br>

//     <p>Thank you,</p>
//     <p><strong>InternArea Team</strong></p>
//   `,
// });

res.json({
  success: true,
});
} catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =============================
// Google Login
// =============================
router.post("/google-login", async (req, res) => {
  try {
    console.log("Google Login API called");
    console.log(req.body);

    const { name, email, photo, googleId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const loginInfo = getLoginInfo(req);

    console.log("GOOGLE LOGIN INFO:", loginInfo);
    // =============================
// Mobile Login Restriction
// =============================
if (
  loginInfo.deviceType === "mobile" &&
  !isMobileLoginAllowed()
) {
  let user = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!user) {
    user = new User({
      name,
      email: email.trim().toLowerCase(),
      phone: "",
      password: "",
      googleId,
      photo,
      loginType: "google",
      friends: [],
      friendRequests: [],
      savedPosts: [],
      loginHistory: [],
    });
  }

  user.loginHistory.push({
    ...loginInfo,
    loginMethod: "google",
    status: "blocked",
    loginAt: new Date(),
  });

  await user.save();

  return res.status(403).json({
    success: false,
    message:
      "Mobile login is allowed only between 10:00 AM and 1:00 PM.",
  });
}

    let user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

 if (!user) {
  user = new User({
    name,
    email,
    phone: "",
    password: "",
    googleId,
    photo,
    loginType: "google",
    loginHistory: [
      {
        ...loginInfo,
        loginMethod: "google",
        status: "success",
        loginAt: new Date(),
      },
    ],
  });

  await user.save();
    } else {
      user.name = name;
      user.photo = photo;
      user.googleId = googleId;
      user.loginType = "google";
    }

    // ==========================================
    // CHROME LOGIN → OTP REQUIRED
    // ==========================================

    if (loginInfo.browser === "Google Chrome") {
      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      user.loginOtp = otp;
      user.loginOtpExpires = new Date(
        Date.now() + 5 * 60 * 1000
      );

      // Save login attempt as OTP pending
      user.loginHistory.push({
        browser: loginInfo.browser,
        operatingSystem: loginInfo.operatingSystem,
        deviceType: loginInfo.deviceType,
        ipAddress: loginInfo.ipAddress,
        loginMethod: "google",
        status: "otp_pending",
        loginAt: new Date(),
      });

      await user.save();
      console.log("===== GOOGLE LOGIN OTP =====");
console.log("Email:", user.email);
console.log("Generated OTP:", otp);
console.log("Stored OTP:", user.loginOtp);
console.log("Expires:", user.loginOtpExpires);

      // Send OTP
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "InternArea Login OTP",
        html: `
          <h2>Login Verification</h2>

          <p>Hello <strong>${user.name}</strong>,</p>

          <p>A Google login was detected from Google Chrome.</p>

          <p>Your OTP is:</p>

          <h1>${otp}</h1>

          <p>This OTP will expire in 5 minutes.</p>

          <p>If you did not try to log in, please secure your account.</p>
        `,
      });

      console.log("Chrome OTP sent to:", user.email);

      return res.json({
        success: true,
        otpRequired: true,
        message: "OTP sent to your registered email",
        email: user.email,
      });
    }

    // ==========================================
    // NON-CHROME LOGIN
    // ==========================================

    user.loginHistory.push({
      browser: loginInfo.browser,
      operatingSystem: loginInfo.operatingSystem,
      deviceType: loginInfo.deviceType,
      ipAddress: loginInfo.ipAddress,
      loginMethod: "google",
      status: "success",
      loginAt: new Date(),
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      "internarea-secret-key",
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      otpRequired: false,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo,
      },
    });

  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =============================
// Get Login History
// =============================
router.get("/login-history/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email)
      .trim()
      .toLowerCase();

    console.log("LOGIN HISTORY REQUEST:", email);

    const user = await User.findOne({ email });

    // User does not exist
    if (!user) {
      return res.status(200).json({
        success: true,
        loginHistory: [],
        message: "No login history found",
      });
    }

    return res.status(200).json({
      success: true,
      loginHistory: user.loginHistory || [],
    });

  } catch (error) {
    console.error("LOGIN HISTORY FETCH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;