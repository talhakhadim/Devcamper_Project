const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getBootcamps,
  createBootcamps,
  updateBootcamps,
  deleteBootcamps,
  getBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");
const advanceResults = require("../middleware/advanceResults");
const Bootcamp = require("../models/Bootcamp");
const courseRouter = require("./courses");
const router = express.Router();
//get courses with a specific bootcamp id
router.use("/:bootcampId/courses", courseRouter);
router
  .route("/")
  .get(advanceResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamps);
router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamps)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamps);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

module.exports = router;
