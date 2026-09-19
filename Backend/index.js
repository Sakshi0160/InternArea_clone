require("dotenv").config();
const Razorpay = require("razorpay");
console.log("DATABASE_URL:", process.env.DATABASE_URL); 
const bodyparser = require("body-parser");
const express = require("express");
const app = express();
const cors = require("cors");
const { connect } = require("./db");
const router = require("./Routes/index");
const Resume = require("./Model/Resume");
const uploadResumeRoute = require("./Routes/uploadResume");
const port = 5001;
const multer = require("multer");
const authRoutes = require("./Routes/auth");
const friendRoutes = require("./Routes/friends");
const postRoutes = require("./Routes/post");
const useragent = require("express-useragent");
const loginHistoryRoutes = require("./Routes/loginHistory");
const subscriptionRoutes = require("./Routes/subscription");
const internshipRoutes = require("./Routes/internship");
const adminRoutes = require("./Routes/admin");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/resumes");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  },
});

const upload = multer({
  storage,
});

// const nodemailer = require("nodemailer");

const otpStore = {};

const transporter = require("./config/mailer");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("Razorpay initialized");

app.use(cors());
app.use(bodyparser.json({ limit: "50mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());
app.use(useragent.express()); 
app.use("/api/internship", internshipRoutes);  
app.use("/api/admin", adminRoutes);

// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "uploads"))
// );

app.get("/", (req, res) => {
  res.send("hello this is internshala backend");
});
connect();
app.use("/api", router);
app.use("/api/auth", authRoutes);
app.use(
  "/api/upload-resume",
  uploadResumeRoute
);
app.use("/api/friends", friendRoutes);
app.use("/api/post", postRoutes);
app.use("/api/login-history", loginHistoryRoutes);
app.use((req, res, next) => {
  req.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
const path = require("path");
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);
app.use("/api/subscription", subscriptionRoutes); 

// app.use("/api/job", jobRoutes);
// app.use("/api/internship", internshipRoutes);

// 👇 Paste OTP routes here

app.post("/api/otp/send-otp", async (req, res) => {
   console.log("OTP request received");
   console.log(req.body);
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "French Language Verification",
      text: `Your OTP is ${otp}`,
    });

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);

    res.json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

app.post("/api/otp/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  console.log("Verify OTP Request");
  console.log("Email:", email);
  console.log("Entered OTP:", otp);
  console.log("Stored OTP:", otpStore[email]);

  if (otpStore[email] === otp) {
    delete otpStore[email];

    return res.json({
      success: true,
    });
  }

  return res.status(400).json({
  success: false,
  message: "Invalid OTP",
});
});
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 5000,
      currency: "INR",
      receipt: "test123",
    });

    console.log(order);

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    console.log("========== ERROR ==========");
    console.log(err);
    console.log(err.error);
    res.status(500).json(err);
  }
});
const crypto = require("crypto");

app.post("/api/payment/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 👇 Paste it here
  const updatedResume = await Resume.findOneAndUpdate(
  { email },
  {
    isPremium: true,
    paymentStatus: "Paid",
  },
  { new: true }
);

console.log(updatedResume);

    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
transporter.verify(function (error, success) {
  if (error) {
    console.log("Mail Error:", error);
  } else {
    console.log("Mail server is ready");
  }
});

// app.listen(port, () => {
//   console.log(`Server is running on the port ${port}`);
// });
app.listen(5001, "0.0.0.0", () => {
  console.log("Server is running on the port 5001");
});
app.post(
  "/api/resume/upload-pdf",
  upload.single("resume"),
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No PDF uploaded",
        });
      }

      const pdfPath = `/uploads/resumes/${req.file.filename}`;

      const updatedResume = await Resume.findOneAndUpdate(
        { email },
        {
          resumePdf: pdfPath,
        },
        {
          new: true,
        }
      );

      if (!updatedResume) {
        return res.status(404).json({
          success: false,
          message: "Resume not found",
        });
      }

      res.json({
        success: true,
        message: "Resume PDF uploaded successfully",
        resumePdf: pdfPath,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);
