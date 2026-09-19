const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Subscription = require("../Model/Subscription");
const transporter = require("../config/mailer");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ==========================================
// CHECK PAYMENT TIME
// Payment allowed only from 10:00 AM to 11:00 AM IST
// ==========================================

function isPaymentTimeAllowed() {
  const now = new Date();

  const istTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = Number(
    istTime.find((part) => part.type === "hour").value
  );

  const minute = Number(
    istTime.find((part) => part.type === "minute").value
  );

  const totalMinutes = hour * 60 + minute;

// Check whether current time is between 10 AM and 11 AM IST
const startTime = 10 * 60; // 10:00 AM
const endTime = 11 * 60;   // 11:00 AM

  return totalMinutes >= startTime && totalMinutes < endTime;
}

// ==========================================
// PLAN DETAILS
// ==========================================

const plans = {
  Bronze: {
    amount: 100,
    applicationLimit: 3,
  },

  Silver: {
    amount: 300,
    applicationLimit: 5,
  },

  Gold: {
    amount: 1000,
    applicationLimit: -1, // unlimited
  },
};


// ==========================================
// GET SUBSCRIPTION PLANS
// ==========================================

router.get("/plans", (req, res) => {
  res.json({
    success: true,

    plans: {
      Free: {
        amount: 0,
        applicationLimit: 1,
      },

      Bronze: plans.Bronze,

      Silver: plans.Silver,

      Gold: plans.Gold,
    },
  });
});


// ==========================================
// CREATE SUBSCRIPTION PAYMENT ORDER
// ==========================================

router.post("/create-order", async (req, res) => {
  try {
    const { email, plan } = req.body;

    if (!email || !plan) {
      return res.status(400).json({
        success: false,
        message: "Email and plan are required",
      });
    }

    // Free plan does not require Razorpay
    if (plan === "Free") {
      return res.status(400).json({
        success: false,
        message: "Free plan does not require payment",
      });
    }

    // Check whether current time is between 10 AM and 11 AM IST
    if (!isPaymentTimeAllowed()) {
      return res.status(403).json({
        success: false,
        message:
          "Payments are allowed only between 10:00 AM and 11:00 AM IST.",
      });
    }

    const selectedPlan = plans[plan];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    const order = await razorpay.orders.create({
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `sub_${Date.now()}`,
    });

    // Create pending subscription
    await Subscription.create({
      email,
      plan,
      amount: selectedPlan.amount,
      applicationLimit: selectedPlan.applicationLimit,
      applicationsUsed: 0,
      paymentStatus: "Pending",
      razorpayOrderId: order.id,
    });

    res.json({
      success: true,
      order,
      plan,
    });

  } catch (error) {
    console.error("Create subscription order error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
});


// ==========================================
// VERIFY SUBSCRIPTION PAYMENT
// ==========================================

router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
    }

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const subscription =
      await Subscription.findOne({
        email,
        razorpayOrderId: razorpay_order_id,
        paymentStatus: "Pending",
      });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const startDate = new Date();

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    subscription.paymentStatus = "Paid";
    subscription.razorpayPaymentId =
      razorpay_payment_id;
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.applicationsUsed = 0;

    await subscription.save();

    // ==========================================
    // SEND INVOICE EMAIL
    // ==========================================

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Subscription Invoice - ${subscription.plan} Plan`,

      html: `
        <h2>Subscription Payment Successful</h2>

        <p>Hello,</p>

        <p>Your subscription has been activated successfully.</p>

        <hr>

        <h3>Invoice Details</h3>

        <p><strong>Plan:</strong> ${subscription.plan}</p>

        <p><strong>Amount:</strong> ₹${subscription.amount}</p>

        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>

        <p><strong>Order ID:</strong> ${razorpay_order_id}</p>

        <p>
          <strong>Start Date:</strong>
          ${startDate.toLocaleDateString("en-IN")}
        </p>

        <p>
          <strong>Expiry Date:</strong>
          ${endDate.toLocaleDateString("en-IN")}
        </p>

        <p>
          <strong>Internship Applications:</strong>
          ${
            subscription.applicationLimit === -1
              ? "Unlimited"
              : subscription.applicationLimit
          }
        </p>

        <hr>

        <p>Thank you for subscribing.</p>
      `,
    });

    res.json({
      success: true,
      message:
        "Payment verified and subscription activated successfully",
      subscription,
    });

  } catch (error) {
    console.error("Verify subscription payment error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// ==========================================
// GET USER SUBSCRIPTION
// ==========================================

router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const subscription =
      await Subscription.findOne({
        email,
        paymentStatus: { $in: ["Paid", "Free"] },
      }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({
        success: true,
        subscription: {
          plan: "Free",
          applicationLimit: 1,
          applicationsUsed: 0,
        },
      });
    }

    // Check expiry
    if (
      subscription.endDate &&
      new Date() > subscription.endDate
    ) {
      return res.json({
        success: true,
        subscription: {
          plan: "Free",
          applicationLimit: 1,
          applicationsUsed: 0,
        },
      });
    }

    res.json({
      success: true,
      subscription,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;