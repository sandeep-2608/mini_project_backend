import screenModel from "../models/screenModel.js";

export const createScreenController = async (req, res) => {
  try {
    const { screenId, title, order } = req.body;
    const createdBy = req.user._id;

    const screen = await screenModel.create({
      screenId,
      title,
      order,
      createdBy,
    });

    res.status(201).send({
      message: "Screen created successfully",
      screen,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in creating screen",
      error,
    });
  }
};

export const getScreensController = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter =
      isActive !== undefined ? { isActive: isActive === "true" } : {};

    const screens = await screenModel.find(filter).sort({ order: 1 });

    if (!screens) {
      return res.status(400).json({
        success: false,
        message: "Screens not found",
      });
    }

    res.json({
      success: true,
      screens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting screens",
      error,
    });
  }
};

export const updateScreenController = async (req, res) => {
  try {
    const { screenId } = req.params;
    const screen = await screenModel.findOneAndUpdate({ screenId }, req.body, {
      new: true,
    });

    if (!screen) {
      return res.status(400).json({
        success: false,
        message: "Screen not found",
      });
    }

    res.json({
      success: true,
      screen,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in updating screen",
    });
  }
};

export const deleteScreenController = async (req, res) => {
  try {
    const { screenId } = req.params;
    const screen = await screenModel.findOneAndDelete({ screenId });

    if (!screen) {
      return res.status(400).json({
        success: false,
        message: "Screen not found",
      });
    }

    res.json({
      success: true,
      message: "Screen deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in deleting screen",
    });
  }
};
