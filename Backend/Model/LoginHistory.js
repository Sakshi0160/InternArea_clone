const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    browser: {
      type: String,
      default: "Unknown",
    },

    browserVersion: {
      type: String,
      default: "",
    },

    operatingSystem: {
      type: String,
      default: "Unknown",
    },

    osVersion: {
      type: String,
      default: "",
    },

    deviceType: {
      type: String,
      enum: ["Desktop", "Laptop", "Mobile", "Tablet", "Unknown"],
      default: "Unknown",
    },

    ipAddress: {
      type: String,
      default: "",
    },

    loginMethod: {
      type: String,
      enum: ["Email Login", "Google Login"],
      default: "Email Login",
    },

    otpRequired: {
      type: Boolean,
      default: false,
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Success", "Pending OTP", "Blocked"],
      default: "Success",
    },

    blockedReason: {
      type: String,
      default: "",
    },

    loginTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoginHistory", loginHistorySchema);