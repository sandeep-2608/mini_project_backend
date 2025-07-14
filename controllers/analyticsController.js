import analyticsModel from "../models/analyticsModel.js";
import screenModel from "../models/screenModel.js";

export const getDropOffStatsController = async (req, res) => {
  try {
    const { screenId } = req.query;

    // Build match stage only for the screenId if provided
    const matchStage = {};
    if (screenId) matchStage.screenId = screenId;

    // Aggregate totals for each screenId across all documents
    const dropOffStats = await analyticsModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$screenId",
          totalDropOffs: { $sum: "$dropOffs" },
          totalViews: { $sum: "$totalViews" },
          totalCompletions: { $sum: "$completions" },
        },
      },
      {
        $addFields: {
          dropOffRate: {
            $cond: [
              { $gt: ["$totalViews", 0] },
              {
                $multiply: [
                  { $divide: ["$totalDropOffs", "$totalViews"] },
                  100,
                ],
              },
              0,
            ],
          },
          conversionRate: {
            $cond: [
              { $gt: ["$totalViews", 0] },
              {
                $multiply: [
                  { $divide: ["$totalCompletions", "$totalViews"] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { dropOffRate: -1 } },
    ]);

    // Get screen details for enrichment
    const screenIds = dropOffStats.map((stat) => stat._id);
    const screens = await screenModel
      .find({ screenId: { $in: screenIds } })
      .select("screenId title screenType order");

    const enrichedStats = dropOffStats.map((stat) => {
      const screen = screens.find((s) => s.screenId === stat._id);
      return {
        ...stat,
        screenTitle: screen?.title || "Unknown Screen",
        screenType: screen?.screenType || "unknown",
        screenOrder: screen?.order || 0,
      };
    });

    res.json({
      success: true,
      data: {
        dropOffStats: enrichedStats,
        summary: {
          totalScreens: enrichedStats.length,
          averageDropOffRate:
            enrichedStats.length > 0
              ? enrichedStats.reduce((sum, stat) => sum + stat.dropOffRate, 0) /
                enrichedStats.length
              : 0,
          highestDropOffScreen: enrichedStats[0] || null,
        },
      },
    });
  } catch (error) {
    console.error("Get drop-off stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching drop-off stats",
    });
  }
};
