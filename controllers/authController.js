import { comparePassword, hashPassword } from "../config/helper.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { username, password } = req.body;

    // validations
    if (!username)
      return res.status(400).send({ message: "Username is required" });
    if (!password)
      return res.status(400).send({ message: "Password is required" });

    // check if user exists
    const userExists = await userModel.findOne({ username });
    if (userExists)
      return res.status(400).send({ message: "User already exists" });

    //register new user
    const hashedPassword = await hashPassword(password);
    //save user
    const user = await new userModel({
      username,
      password: hashedPassword,
    }).save();
    res.status(201).send({ message: "User created successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in register controller" });
  }
};

export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;

    //validation
    if (!username || !password)
      return res.status(400).send({ message: "Invalid Username or Password" });

    // check user
    const user = await userModel.findOne({ username });
    if (!user) return res.status(404).send({ message: "User not found" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(200).send({ message: "Invalid Password" });

    // token
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in login controller" });
  }
};

export const testController = (req, res) => {
  res.status(200).send({
    message: "Test successful",
  });
};
