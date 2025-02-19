const { parentPort, workerData } = require('worker_threads');
const db = require('../config/db');

// Fetch user profile from the database
const fetchUserProfile = async (userId) => {
  try {
    const query = `
      SELECT 
        u.id, 
        COALESCE(u.name, 'Guest') AS user_name, 
        COALESCE(u.email, 'guest@example.com') AS email, 
        COALESCE(u.phone, 'Not Provided') AS phone, 
        COALESCE(u.university_id, 1) AS university_id, 
        COALESCE(uni.name, 'Unknown University') AS university_name, 
        COALESCE(u.college_id, 1) AS college_id, 
        COALESCE(col.name, 'Unknown College') AS college_name, 
        COALESCE(u.course_id, 1) AS course_id, 
        COALESCE(crs.name, 'Unknown Course') AS course_name, 
        COALESCE(u.branch_id, 1) AS branch_id, 
        COALESCE(br.name, 'Unknown Branch') AS branch_name, 
        COALESCE(u.semester_id, 1) AS semester_id, 
        COALESCE(sem.name, 'Unknown Semester') AS semester_name, 
        COALESCE(u.subjects, '[435,436,425]'::jsonb) AS subjects
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
