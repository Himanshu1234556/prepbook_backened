const { parentPort } = require('worker_threads');
const db = require('../config/db');

// Fetch marketing assets
const fetchMarketingAssets = async () => {
  try {
    const query = 'SELECT * FROM marketing_assets ORDER BY order_priority ASC';
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching marketing assets:', error);
    throw error;
  }
};

// Send the result back to the parent thread
fetchMarketingAssets()
  .then((assets) => {
    parentPort.postMessage(assets);  // Use parentPort to send data to the main thread
  })
  .catch((error) => {
    parentPort.postMessage({ error: 'Error fetching marketing assets' });
  });
