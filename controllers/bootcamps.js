const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const geocoder = require("../utils/geocoder");

//@desc get all bootcamps

//@route Get   api/v1/bootcamps
//@access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceResults);
});
//@desc get a single  bootcamps
//@route Get   api/v1/bootcamps/:id
//@access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id).populate("courses");

  if (!bootcamp) {
    return next(new ErrorResponse("Resource not Not found", 404));
  }
  res.status(200).json({ success: true, data: bootcamp });
});
//@desc Create new bootcamps
//@route Post   api/v1/bootcamps
//@access  Private
exports.createBootcamps = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  //check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
  //check if the user has a role of admin to add more than one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `the user with id ${req.user.id} has already published one bootcamp`
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  if (!bootcamp) {
    return next(new ErrorResponse("bootcamp not created", 400));
  }
  res.status(201).json({ success: true, data: bootcamp });
});
//@desc update a bootcamp
//@route Put   api/v1/bootcamps/:id
//@access  Private
exports.updateBootcamps = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse("Resource not Not found", 404));
  }
  //check if the user is the owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You are not authorize to update this bootcamp", 401)
    );
  }
  await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});
//@desc Delete a bootcamp
//@route Delete   api/v1/bootcamps/:id
//@access  Private
exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse("Resource not Not found", 404));
  }
  //check if the user is the owner
  if (bootcamp.id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You are not authorize to delete this bootcamp", 401)
    );
  }
  bootcamp.remove();

  res.status(200).json({ success: true, msg: `Resource deleted` });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
//@desc upload a photo of bootcamp
//@route PUT  api/v1/bootcamps/:id/photo
//@access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse("Resource not Not found", 404));
  }
  //check if user upload a file
  if (!req.files) {
    return next(new ErrorResponse("pease upload a file", 400));
  }

  const file = req.files.file;
  //check if user upload an image file

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("pease upload a image file", 400));
  }
  //check if user upload image of a limited size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `pease upload a image file of size < ${process.env.MAX_FILE_UPLOAD} `,
        400
      )
    );
  }
  //change the file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  console.log(file.name);
  //upload the file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`problem with file upload `, 500));
    }
    //check if the user is the owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse("You are not authorize to update this bootcamp", 401)
      );
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});
