const db = require('../config/db');
const { Worker } = require('worker_threads');
const path = require('path');

// Controller to fetch both app info and marketing assets in one API
exports.getAppData = async (req, res) => {
  try {
    // First, fetch app info from the database
    const appInfoQuery = 'SELECT * FROM app_info LIMIT 1';
    const appInfoResult = await db.query(appInfoQuery);

    if (appInfoResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'App info not found',
        data: null,
      });
    }

    const appInfo = appInfoResult.rows[0];

    // Now, fetch marketing assets using a worker thread
    const worker = new Worker(path.join(__dirname, '../worker_threads/marketingAssetsWorker.js'));

    worker.on('message', (marketingAssets) => {
      // Once the worker returns marketing assets, send the combined response
      res.status(200).json({
        status: 'success',
        message: 'Request was successful',
        data: {
          app_info: appInfo,
          marketing_assets: marketingAssets,
        },
      });
    });

    worker.on('error', (error) => {
      console.error('Worker Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error processing marketing assets',
        data: null,
      });
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  } catch (error) {
    console.error('Error fetching app data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      data: null,
    });
  }
};
