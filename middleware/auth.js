const asyncHandler = require("./async");
const errorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  //   else if (req.cookies.token) {
  //     token = req.cookies.token;
  //   }
  //Make sure token exists
  if (!token) {
    return next(new errorResponse("Not authorize to access this route", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    // console.log(req.user);

    next();
  } catch (err) {
    return next(new errorResponse("Not authorize to access this route", 401));
  }
});
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new errorResponse(
          `user role" ${req.user.role}" is not authorize to access this route`
        ),
        403
      );
    }
    next();
  };
};
