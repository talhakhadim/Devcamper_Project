const express = require("express");
const { protect } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

const router = express.Router();

router.route("/register").post(protect, registerUser);
router.route("/login").post(loginUser);
router.route("/me").get(protect, getMe);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resettoken").put(resetPassword);
module.exports = router;
