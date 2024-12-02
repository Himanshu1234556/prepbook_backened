const { parentPort, workerData } = require('worker_threads');
const db = require('../config/db');

// Fetch user profile from the database
const fetchUserProfile = async (userId) => {
  try {
    const query = `
      SELECT 
        id, name, email, phone, university_id, college_id, course_id, branch_id, semester_id, subjects
      FROM 
        users 
      WHERE 
        id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Execute when the worker starts
fetchUserProfile(workerData.userId)
  .then((profile) => {
    parentPort.postMessage(profile);  // Send the profile data to the parent thread
  })
  .catch((error) => {
    parentPort.postMessage({ error: 'Error fetching user profile' });
  });
