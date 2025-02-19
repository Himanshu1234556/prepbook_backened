const adConfig = {
    app_id: "ca-app-pub-5323100540076213~5708884028", // Test App ID
    app_open_ad: {
      status: true,
      key: "ca-app-pub-3940256099942544/9257395921", // Test App Open Ad ID
    },
    adaptive_banner_ad: {
      status: true,
      key: "ca-app-pub-5323100540076213/3595185560", // Test Adaptive Banner Ad ID
      frequency: 1, // Frequency for displaying the ad
    },
    fixed_size_banner_ad: {
      status: true,
      key: "ca-app-pub-5323100540076213/3595185560", // Test Fixed Size Banner Ad ID
      frequency: 1, // Frequency for displaying the ad
    },
    interstitial_ad: {
      status: true,
      key: "ca-app-pub-5323100540076213/2943119881", // Test Interstitial Ad ID
      frequency: 1, // Frequency for displaying the ad
    },
    rewarded_ad: {
      status: true,
      key: "ca-app-pub-5323100540076213/5577780255", // Test Rewarded Ad ID
      pages_count: 10, // Number of pages to display before showing the ad
    },
    rewarded_interstitial_ad: {
      status: true,
      key: "ca-app-pub-5323100540076213/6699290238", // Test Rewarded Interstitial Ad ID
      frequency: 6, // Frequency for displaying the ad
    },
    native_ad: {
      status: true,
      key: "ca-app-pub-5323100540076213/6482909648", // Test Native Ad ID
      placement: ["home_page", "pdf_viewer"], // Placement of native ads
    },
    native_video_ad: {
      status: true,
      key: "ca-app-pub-5323100540076213/6482909648", // Test Native Video Ad ID
      placement: ["video_player", "home_page"], // Placement of native video ads
    },
    ads_global_config: {
      ads_enabled: true, // Flag to enable/disable all ads
      min_app_version: "1.0.5", // Minimum app version for ads
      max_daily_ads_per_user: 20, // Max ads displayed per user daily
    },
  };
  
  // Export Ad Configuration
  module.exports = adConfig;
  