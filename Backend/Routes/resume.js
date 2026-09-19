const express = require("express");
const router = express.Router();
const ResumeModel = require("../Model/Resume");
const upload = require("../Uploads/resumes/upload");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
// ==============================
// Create Resume
// ==============================

router.post("/", async (req, res) => {
  try {
    const {
      email,
      fullName,
      phone,
      address,
      objective,
      skills,
      education,
      experience,
      projects,
      certifications,
      languages,
      hobbies,
      linkedin,
      github,
      profilePhoto,
    } = req.body;

    // Check if resume already exists
    const existingResume = await ResumeModel.findOne({ email });

    if (existingResume) {
      const updatedResume = await ResumeModel.findOneAndUpdate(
        { email },
        {
          fullName,
          phone,
          address,
          objective,
          skills,
          education,
          experience,
          projects,
          certifications,
          languages,
          hobbies,
          linkedin,
          github,
          profilePhoto,
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Resume updated successfully",
        data: updatedResume,
      });
    }

    // Create new resume
    const resume = new ResumeModel({
      email,
      fullName,
      phone,
      address,
      objective,
      skills,
      education,
      experience,
      projects,
      certifications,
      languages,
      hobbies,
      linkedin,
      github,
      profilePhoto,
      isPremium: false,
      paymentStatus: "Pending",
    });

    const savedResume = await resume.save();

    return res.status(201).json({
      success: true,
      // message: "",
      data: savedResume,
    });

  } catch (error) {
    console.error("Resume API Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ==============================
// Get Resume by Student ID
// ==============================

router.get("/:email", async (req, res) => {

  try {

    const resume = await ResumeModel.findOne({
      email: req.params.email,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }

});
// ==============================
// Update Resume
// ==============================

router.put("/:email", async (req, res) => {
  try {

    // Prevent payment fields from being changed here
    delete req.body.isPremium;
    delete req.body.paymentStatus;

    const updatedResume = await ResumeModel.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedResume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.status(200).json({
      success: true,
      // message: "",
      data: updatedResume,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
// ==============================
// Delete Resume
// ==============================

router.delete("/:email", async (req, res) => {

  try {

    const deletedResume = await ResumeModel.findOneAndDelete({
      email: req.params.email,
    });

    if (!deletedResume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }

});
router.post("/save-profile-photo", async (req, res) => {

  try {
    const { email, photoURL } = req.body;

    if (!email || !photoURL) {
      return res.status(400).json({
        success: false,
        message: "Email and photoURL are required",
      });
    }

    // Create folder if it doesn't exist
    const profileDir = path.join(__dirname, "../uploads/profile");

    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }

    // Download image from Google
    const response = await axios.get(photoURL, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const filename = `${Date.now()}-${email.replace(/[@.]/g, "_")}.jpg`;
    const filepath = path.join(profileDir, filename);

    // Save image locally
    fs.writeFileSync(filepath, response.data);

    const imagePath = `/uploads/profile/${filename}`;

    // Update MongoDB
    // Find existing resume
const existingResume = await ResumeModel.findOne({ email });

// Delete old profile photo if it exists
if (
  existingResume &&
  existingResume.profilePhoto &&
  existingResume.profilePhoto.startsWith("/uploads/profile/")
) {
  const oldImagePath = path.join(
    __dirname,
    "..",
    existingResume.profilePhoto
  );

  if (fs.existsSync(oldImagePath)) {
    fs.unlinkSync(oldImagePath);
    console.log("Old profile photo deleted");
  }
}

// Update MongoDB
const updatedResume = await ResumeModel.findOneAndUpdate(
  { email },
  { profilePhoto: imagePath },
  { new: true }
);

    res.json({
      success: true,
      profilePhoto: imagePath,
      data: updatedResume,
    });
  } catch (err) {
    console.log("SAVE PROFILE PHOTO ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to save profile photo",
    });
  }
});
module.exports = router;