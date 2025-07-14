import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import analyticsModel from "../models/analyticsModel.js";

export const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// protected routes token base
export const authenticateToken = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    console.log(decode);
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};

// update analytics
export const bump = (screenId, incObj) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return analyticsModel.findOneAndUpdate(
    { date: today, screenId },
    { $inc: incObj },
    { upsert: true, new: true }
  );
};
