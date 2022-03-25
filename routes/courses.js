const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");
const { protect, authorize } = require("../middleware/auth");
const advanceResults = require("../middleware/advanceResults");
const express = require("express");
const Course = require("../models/Course");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advanceResults(Course, {
      path: "bootcamp",
      select: "name",
    }),
    getCourses
  )
  .post(protect, authorize("publisher", "admin"), addCourse);
// router.route("/bootcamps/:bootcampId/courses").get(getCourses)
router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("publisher", "admin"), updateCourse)
  .delete(protect, authorize("publisher", "admin"), deleteCourse);

module.exports = router;
