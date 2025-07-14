import { v4 as uuidv4 } from "uuid";
import sessionModel from "../models/sessionModel.js";
import screenModel from "../models/screenModel.js";
import { bump } from "../config/helper.js";

// Start a new session
export const startSessionController = async (req, res) => {
  try {
    const sessionId = uuidv4();
    const session = await sessionModel.create({
      sessionId,
      userId: req.user._id,
    });

    // Get first screen
    const firstScreen = await screenModel
      .findOne({ isActive: true })
      .sort({ order: 1 });

    if (firstScreen) {
      session.currentScreen = firstScreen.screenId;
      session.viewedScreens.push({
        screenId: firstScreen.screenId,
        viewedAt: new Date(),
      });
      await session.save();

      // Update analytics for view
      await bump(firstScreen.screenId, { totalViews: 1 });

      res.status(201).json({
        success: true,
        data: {
          sessionId,
          currentScreen: firstScreen?.screenId,
          firstScreen,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No active screens found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in starting session",
      error: error.message,
    });
  }
};

// Middleware: Track a view for each screen
// export const trackView = async (req, res, next) => {
//   const { screenId } = req.params;
//   if (screenId) await bump(screenId, { totalViews: 1 });
//   next();
// };

export const recordResponseController = async (req, res) => {
  try {
    const { sessionId, screenId, answer } = req.body;
    const session = await sessionModel.findOne({
      sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Record response
    session.responses.set(screenId, answer);
    await incrementCompletion(screenId);

    // Go to next screen
    const currentScreen = await screenModel.findOne({ screenId });
    const nextScreen = await screenModel
      .findOne({
        isActive: true,
        order: { $gt: currentScreen.order },
      })
      .sort({ order: 1 });

    if (nextScreen) {
      session.currentScreen = nextScreen.screenId;

      // Track view of next screen
      const alreadyViewed = session.viewedScreens.some(
        (v) => v.screenId === nextScreen.screenId
      );

      if (!alreadyViewed) {
        session.viewedScreens.push({
          screenId: nextScreen.screenId,
          viewedAt: new Date(),
        });
        // Update analytics for view
        await bump(nextScreen.screenId, { totalViews: 1 });
      }
    } else {
      // No more screens, complete the session
      session.status = "completed";
      await finalizeSession(session);
    }

    await session.save();

    res.json({
      success: true,
      data: {
        sessionId,
        currentScreen: nextScreen?.screenId,
        screen: nextScreen,
        isCompleted: session.status === "completed",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in recording response",
      error: error.message,
    });
  }
};

export const incrementCompletion = (screenId) =>
  bump(screenId, { completions: 1 });

// Finalize a session: detect drop-offs
export const finalizeSession = async (session) => {
  try {
    // Get all screens in order
    const allScreens = await screenModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .select("screenId order")
      .lean();

    // Get screens that were viewed
    const viewedScreenIds = session.viewedScreens.map((v) => v.screenId);

    // Get screens that were answered
    const answeredScreenIds = Array.from(session.responses.keys());

    // Calculate drop-offs: screens that were viewed but not answered
    const dropOffScreens = viewedScreenIds.filter(
      (screenId) => !answeredScreenIds.includes(screenId)
    );

    // Also check for sequential drop-offs
    // If user viewed screen A but not screen B (next in sequence),
    // then screen B is a drop-off point
    for (let i = 0; i < allScreens.length - 1; i++) {
      const currentScreen = allScreens[i];
      const nextScreen = allScreens[i + 1];

      if (
        viewedScreenIds.includes(currentScreen.screenId) &&
        !viewedScreenIds.includes(nextScreen.screenId)
      ) {
        if (!dropOffScreens.includes(nextScreen.screenId)) {
          dropOffScreens.push(nextScreen.screenId);
        }
      }
    }

    // Bulk-increment dropOffs for all drop-off screens
    await Promise.all(
      dropOffScreens.map((screenId) => bump(screenId, { dropOffs: 1 }))
    );

    console.log(
      `Session ${session.sessionId} finalized. Drop-offs: ${dropOffScreens.length}`
    );
  } catch (error) {
    console.error("Error finalizing session:", error);
  }
};

export const getNextScreenController = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await sessionModel.findOne({
      sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const screen = await screenModel.findOne({
      screenId: session.currentScreen,
    });

    if (screen) {
      // Track view if not already viewed
      const alreadyViewed = session.viewedScreens.some(
        (v) => v.screenId === screen.screenId
      );

      if (!alreadyViewed) {
        session.viewedScreens.push({
          screenId: screen.screenId,
          viewedAt: new Date(),
        });
        await session.save();

        // Update analytics for view
        await bump(screen.screenId, { totalViews: 1 });
      }
    }

    res.json({
      success: true,
      data: {
        sessionId,
        currentScreen: screen?.screenId,
        screen,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting next screen",
      error: error.message,
    });
  }
};
