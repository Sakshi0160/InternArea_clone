const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    friendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    // ==========================
    // Login History
    // ==========================
    loginHistory: [
      {
        browser: {
          type: String,
          default: "",
        },

        operatingSystem: {
          type: String,
          default: "",
        },

        deviceType: {
          type: String,
          enum: [
            "desktop",
            "laptop",
            "mobile",
            "tablet",
            "unknown",
          ],
          default: "unknown",
        },

        ipAddress: {
          type: String,
          default: "",
        },

        loginMethod: {
          type: String,
          enum: ["email", "google"],
          default: "email",
        },

        status: {
          type: String,
          enum: [
            "success",
            "failed",
            "blocked",
            "otp_pending",
          ],
          default: "success",
        },

        loginAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ==========================
    // Login OTP
    // ==========================
    loginOtp: {
      type: String,
      default: "",
    },

    loginOtpExpires: {
      type: Date,
      default: null,
    },

    phone: {
      type: String,
      default: "",
      sparse: true,
    },

    password: {
      type: String,
      default: "",
    },

    photo: {
      type: String,
      default: "",
    },

    googleId: {
      type: String,
      default: "",
    },

    loginType: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },

    lastPasswordReset: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);