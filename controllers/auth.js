const crypto = require("crypto");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");

//@desc Register a user
//route POST api/v1/auth/register
//public

exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });

  sendTokenResponse(user, 200, res);
});
//@desc login user
//route POST api/v1/auth/login

exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorResponse("please enter an email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("invalid credentials", 401));
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("invalid credentials", 401));
  }
  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
//get user profile
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({ success: true, data: user });
});

//forgot password
//route POST api/v1/auth/forgotpassword
//public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse("Email not registered", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  //set reset password url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});
//rest password
//route PUT api/v1/auth/resetpassword/:resettoken

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //hash the token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse("Inavalid token", 400));
  }
  //set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
});
