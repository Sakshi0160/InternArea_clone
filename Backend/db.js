const mongoose = require("mongoose");

require("dotenv").config();

const url = process.env.DATABASE_URL;

module.exports.connect = async () => {
  try {
    await mongoose.connect(url);
    console.log("Database is connected");
  } catch (err) {
    console.log("Database connection failed:", err.message);
  }
};