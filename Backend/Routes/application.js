const express = require("express");
const router = express.Router();
const application = require("../Model/Application");
const ResumeModel = require("../Model/Resume");
const Subscription = require("../Model/Subscription");

router.post("/", async (req, res) => {
  try {
    const userEmail = req.body.user.email;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    // ==========================================
    // FIND USER SUBSCRIPTION
    // ==========================================

    let subscription = await Subscription.findOne({
      email: userEmail,
      paymentStatus: "Paid",
    }).sort({ createdAt: -1 });

    // ==========================================
    // CHECK SUBSCRIPTION EXPIRY
    // ==========================================

    if (
      subscription &&
      subscription.endDate &&
      new Date() > subscription.endDate
    ) {
      subscription = null;
    }

    // ==========================================
    // FREE PLAN
    // ==========================================

    if (!subscription) {
      const currentMonth = new Date();

      const startOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      );

      const endOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      );

      const monthlyApplications =
        await application.countDocuments({
          "user.email": userEmail,
          createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
        });

      if (monthlyApplications >= 1) {
        return res.status(403).json({
          success: false,
          message:
            "You have reached the Free Plan limit of 1 internship application per month. Please upgrade your plan.",
        });
      }
    }

    // ==========================================
    // PAID PLAN APPLICATION LIMIT
    // ==========================================

    if (subscription) {
      if (subscription.applicationLimit !== -1) {

        if (
          subscription.applicationsUsed >=
          subscription.applicationLimit
        ) {
          return res.status(403).json({
            success: false,
            message:
              `You have reached the ${subscription.plan} Plan limit of ${subscription.applicationLimit} applications.`,
          });
        }
      }
    }

    // ==========================================
    // FIND LATEST RESUME
    // ==========================================

    const resume = await ResumeModel.findOne({
      email: userEmail,
    });

    // ==========================================
    // CREATE APPLICATION
    // ==========================================

    const applicationipdata = new application({
      company: req.body.company,

      category: req.body.category,

      coverLetter: req.body.coverLetter,

      user: req.body.user,

      Application: req.body.Application,
    
     availability: req.body.availability,

      resume: resume ? resume._id : null,
    });

    const savedApplication =
      await applicationipdata.save();

    // ==========================================
    // UPDATE PAID PLAN USAGE
    // ==========================================

    if (subscription) {
      subscription.applicationsUsed += 1;

      await subscription.save();
    }

    res.status(201).json({
      success: true,
      message: "Application submitted",
      data: savedApplication,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
router.get("/", async (req, res) => {
  try {
    const data = await application.find();
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await application.findById(id);
    if (!data) {
      res.status(404).json({ error: "application not found" });
    }
res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "internal server error" });
  }
});
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  let status;
  if (action === "accepted") {
    status = "accepted";
  } else if (action === "rejected") {
    status = "rejected";
  } else {
    res.status(404).json({ error: "Invalid action" });
    return;
  }
  try {
    const updateapplication = await application.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updateapplication) {
      res.status(404).json({ error: "Not able to update the application" });
      return;
    }
    res.status(200).json({ sucess: true, data: updateapplication });
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
});
module.exports = router;
