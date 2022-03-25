const mongoose = require("mongoose");
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    require: [true, "Please provide a course title"],
  },
  description: {
    type: String,
    require: [true, "please add the course description."],
  },
  weeks: {
    type: String,
    require: [true, "please add the number of weeks."],
  },
  tution: {
    type: Number,
    require: [true, "please add a tution cost "],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a skill level"],
    enum: ["beginner", "intermediate", "Advance"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    require: true,
  },
});

module.exports = mongoose.model("Course", CourseSchema);
