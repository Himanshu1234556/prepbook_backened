// Fetch user profile (multithreaded)
const userService = require('../services/userService');
const { cacheEbooksAndFreeResources } = require('../helpers/resourceCache');
const { Worker } = require('worker_threads');
const path = require('path');


exports.updateProfile = async (req, res) => {
    const { userId } = req.user; // Extract user ID from JWT

    try {
        // Extract the fields from the request body
        const { name, email, university_id, college_id, course_id, branch_id, semester_id, subjects, fcm_token } = req.body;

        const profileData = {};

        if (name) profileData.name = name;
        if (email) profileData.email = email;
        if (university_id) profileData.university_id = university_id;
        if (college_id) profileData.college_id = college_id;
        if (course_id) profileData.course_id = course_id;
        if (branch_id) profileData.branch_id = branch_id;
        if (semester_id) profileData.semester_id = semester_id;
        if (fcm_token) profileData.fcm_token = fcm_token;
        // Ensure subjects is valid JSON
        if (subjects) {
            try {
                // Parse and validate subjects to ensure it’s in JSON format
                profileData.subjects = Array.isArray(subjects) ? JSON.stringify(subjects) : subjects;
            } catch (error) {
                return res.status(400).json({ error: 'Invalid JSON format for subjects' });
            }
        }

        // Call service function to update the profile
        const updatedUser = await userService.updateUserProfile(userId, profileData);
        res.status(200).json({ message: 'Profile updated' });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: error.message });
    }
};







// Fetch user profile (multithreaded)
exports.fetchUserProfile = (req, res) => {
    const { userId } = req.user;  // Assuming JWT token verification is done

    if (!userId) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Create a new worker to handle profile fetching
    const worker = new Worker(path.join(__dirname, '../worker_threads/profileWorker.js'), {
        workerData: { userId: userId }
    });

    // Handle messages from the worker
    worker.on('message', async (profile) => {
        if (profile.error) {
            return res.status(500).json({ message: profile.error });
        }

        // Start caching ebooks and free resources in the background
        (async () => {
            await cacheEbooksAndFreeResources(userId);
        })();

        // Return the profile immediately
        res.status(200).json({ profile });
    });

    // Handle worker errors
    worker.on('error', (error) => {
        console.error('Worker Error:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    });

    // Handle worker exit
    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
            res.status(500).json({ message: 'Worker process failed' });
        }
    });
};
