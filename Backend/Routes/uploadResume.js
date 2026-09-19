const express = require("express");
const router = express.Router();
const multer = require("multer");
const Resume = require("../Model/Resume");
const path = require("path");
const fs = require("fs");

// Storage
const storage = multer.diskStorage({
destination: (req, file, cb) => {
  cb(null, path.join(__dirname, "../Uploads/resumes"));
},

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  },
});

const upload = multer({
  storage,
});

// Upload Resume PDF
router.post(
  "/",
  upload.single("resume"),
  async (req, res) => {

    try {

      const { email } = req.body;

const filePath = `/uploads/resumes/${req.file.filename}`;

// Find existing resume
const existingResume = await Resume.findOne({ email });

// Delete old PDF if it exists
if (
  existingResume &&
  existingResume.resumePdf &&
  existingResume.resumePdf.startsWith("/uploads/resumes/")
) {
  const oldPdfPath = path.join(
    __dirname,
    "..",
    existingResume.resumePdf
  );

  if (fs.existsSync(oldPdfPath)) {
    fs.unlinkSync(oldPdfPath);
    console.log("Old resume deleted");
  }
}

// Update MongoDB
const updatedResume = await Resume.findOneAndUpdate(
  { email },
  { resumePdf: filePath },
  { new: true }
);
      res.json({
        success: true,
        message: "Resume attached successfully",
        file: filePath,
        data: updatedResume,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: "Upload failed",
      });

    }

  }
);

module.exports = router;