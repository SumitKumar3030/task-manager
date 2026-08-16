const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

exports.register = async (req, res) => {
  let createdUser = null;
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry,
    });
    createdUser = user;

    await sendEmail({
      to: email,
      subject: "Verify your TaskFlow account",
      html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;

    res.status(201).json({
      success: true,
      message: "Registered. Please verify the OTP sent to your email.",
      user: userResponse,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    if (createdUser) {
      await User.findByIdAndDelete(createdUser._id).catch(() => {});
    }
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired, please request a new one" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: "Your new TaskFlow verification code",
      html: `<p>Your new verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });

    res.json({ success: true, message: "OTP resent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        needsVerification: true,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, token, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Don't reveal if user exists — respond the same either way
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists, a reset code has been sent.",
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: "Reset your TaskFlow password",
      html: `<p>Your password reset code is <b>${otp}</b>. It expires in 10 minutes. If you didn't request this, ignore this email.</p>`,
    });

    res.json({
      success: true,
      message: "If an account exists, a reset code has been sent.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid code" });
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Code expired, please request a new one" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully. Please log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};