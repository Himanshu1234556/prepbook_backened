const { parentPort, workerData } = require('worker_threads');
const db = require('../config/db');

// Fetch user profile from the database
const fetchUserProfile = async (userId) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.name AS user_name, 
        u.email, 
        u.phone, 
        u.university_id, 
        uni.name AS university_name, 
        u.college_id, 
        col.name AS college_name, 
        u.course_id, 
        crs.name AS course_name, 
        u.branch_id, 
        br.name AS branch_name, 
        u.semester_id, 
        sem.name AS semester_name, 
        u.subjects
      FROM 
        users u
      LEFT JOIN 
        universities uni ON u.university_id = uni.id
      LEFT JOIN 
        colleges col ON u.college_id = col.id
      LEFT JOIN 
        course crs ON u.course_id = crs.id
      LEFT JOIN 
        branches br ON u.branch_id = br.id
      LEFT JOIN 
        semesters sem ON u.semester_id = sem.id
      WHERE 
        u.id = $1
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
    parentPort.postMessage(profile); // Send the profile data to the parent thread
  })
  .catch((error) => {
    parentPort.postMessage({ error: 'Error fetching user profile' });
  });
