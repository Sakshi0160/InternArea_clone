const express = require("express");

const router = express.Router();

const Internship = require("../Model/Internship");

// POST - Create Internship
router.post("/", async (req, res) => {
  try {
    const Internshipdata = new Internship({
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      category: req.body.category,
      aboutCompany: req.body.aboutCompany,
      aboutInternship: req.body.aboutInternship,
      whoCanApply: req.body.whoCanApply,
      perks: req.body.perks,
      numberOfOpening: req.body.numberOfOpening,
      stipend: req.body.stipend,
      startDate: req.body.startDate,
      additionalInfo: req.body.additionalInfo,
    });

    const data = await Internshipdata.save();

    res.status(201).json(data);
  } catch (error) {
    console.log("Error creating internship:", error);

    res.status(500).json({
      error: "Failed to create internship",
    });
  }
});

// GET - Get all internships
router.get("/", async (req, res) => {
  try {
    const data = await Internship.find().sort({ _id: -1 });

    res.status(200).json(data);
  } catch (error) {
    console.log("Error fetching internships:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// GET - Get single internship
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const data = await Internship.findById(id);

    if (!data) {
      return res.status(404).json({
        error: "Internship not found",
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.log("Error fetching internship:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = router;