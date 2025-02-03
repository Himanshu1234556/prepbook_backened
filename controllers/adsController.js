const adConfig = require('../models/adsModel');

// Controller to fetch Ad Configuration
const getAdsConfig = (req, res) => {
  try {
    res.json({
      success: true,
      message: "Ad configuration fetched successfully",
      data: adConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch ad configuration",
      error: error.message
    });
  }
};

module.exports = { getAdsConfig };
