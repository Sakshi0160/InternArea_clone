const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    university: String,
    startYear: String,
    endYear: String,
    percentage: String,
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    duration: String,
    description: String,
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    technologies: String,
    github: String,
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    title: String,
    organization: String,
    year: String,
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: String,

    objective: String,

    skills: [String],

    education: [educationSchema],

    experience: [experienceSchema],

    projects: [projectSchema],

    certifications: [certificationSchema],

    languages: [String],

    hobbies: [String],

    linkedin: String,

    github: String,

    profilePhoto: {
      type: String,
      default: "",
    },

    resumePdf: {
      type: String,
      default: "",
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);