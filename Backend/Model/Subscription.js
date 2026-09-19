const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  plan: {
    type: String,
    enum: ["Free", "Bronze", "Silver", "Gold"],
    default: "Free",
  },

  amount: {
    type: Number,
    default: 0,
  },

  applicationLimit: {
    type: Number,
    default: 1,
  },

  applicationsUsed: {
    type: Number,
    default: 0,
  },

  startDate: {
    type: Date,
    default: Date.now,
  },

  endDate: {
    type: Date,
  },

  paymentStatus: {
    type: String,
    enum: ["Free", "Pending", "Paid"],
    default: "Free",
  },

  razorpayOrderId: {
    type: String,
    default: null,
  },

  razorpayPaymentId: {
    type: String,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);