const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

//@des get the courses
//@route Get api/v1/courses    api/v1/bootcamps/:bootcampId/courses
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advanceResults);
  }
});

//@desc get a single course
//route GET api/v1/courses/:id

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!course) {
    return next(
      new ErrorResponse(`No course found with id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: course });
});

//@desc add a course
//route POST api/v1/bootcamps/bootcampId/courses
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp found with the id: ${req.params.bootcampId}`,
        404
      )
    );
  }
  //check if the user is the owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        "You are not authorize to add a course to this bootcamp",
        401
      )
    );
  }
  const course = await Course.create(req.body);
  res.status(200).json({ success: true, data: course });
});
//@des update course
//@route  PUT api/v1/courses/:id

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course found with id: ${req.params.id}`, 404)
    );
  }
  //check if the user is the owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You are not authorize to update this course ", 401)
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: course });
});

//@des delete course
//@route  DELETE api/v1/courses/:id

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course found with id: ${req.params.id}`, 404)
    );
  }
  //check if the user is the owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You are not authorize to delete this course", 401)
    );
  }
  course.remove();

  res.status(200).json({
    success: true,
    msg: `course deleted with the id ${req.params.id}`,
  });
});
