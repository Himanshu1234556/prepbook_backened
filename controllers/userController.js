const userService = require('../services/userService');
const { cacheEbooksAndFreeResources } = require('../helpers/resourceCache');
const { Worker } = require('worker_threads');
const path = require('path');
const redis = require('../config/redisClient'); // Import Redis client
const NodeCache = require('node-cache'); // Import node-cache
const localCache = require('../config/localcache'); // Import shared cache


// Update user profile
exports.updateProfile = async (req, res) => {
    const { userId } = req.user; // Extract user ID from JWT

    try {
         // Log the received data for debugging
         console.log('Received data for updateProfile:', req.body);

        // Extract fields from the request body
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

        // Handle `subjects` field validation
        if (subjects) {
            try {
                // Parse and validate subjects to ensure it’s in JSON format
                profileData.subjects = Array.isArray(subjects) ? JSON.stringify(subjects) : subjects;
            } catch (error) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid JSON format for subjects',
                });
            }
        }

        // Call service function to update the profile
        await userService.updateUserProfile(userId, profileData);

        // Cache keys for ebooks and free resources
        const ebooksCacheKey = `ebooks:${userId}`;
        const freeResourcesCacheKey = `free_resources:${userId}`;
       //  console.log(ebooksCacheKey);
        // console.log('Cache keys before deletion:', localCache.keys());
    
        localCache.del(ebooksCacheKey); // Remove ebooks cache from local cache
        localCache.del(freeResourcesCacheKey); // Remove free resources cache from local cache
        await redis.del(ebooksCacheKey); // Remove ebooks cache from Redis
        await redis.del(freeResourcesCacheKey); // Remove free resources cache from Redis
       // console.log('Cache keys after deletion:', localCache.keys());
        // Success response
        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};

// Fetch user profile (multithreaded)
exports.fetchUserProfile = (req, res) => {
    const { userId } = req.user; // Extract user ID from JWT

    if (!userId) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid user ID',
        });
    }

    // Create a new worker to handle profile fetching
    const worker = new Worker(path.join(__dirname, '../worker_threads/profileWorker.js'), {
        workerData: { userId }
    });

    // Handle messages from the worker
    worker.on('message', async (profile) => {
        if (profile.error) {
            return res.status(500).json({
                status: 'error',
                message: profile.error,
            });
        }

        // Start caching ebooks and free resources in the background
        (async () => {
            try {
                await cacheEbooksAndFreeResources(userId);
            } catch (error) {
                console.error('Error caching resources:', error);
            }
        })();

        // Send profile data as a success response
        res.status(200).json({
            status: 'success',
            message: 'Profile fetched successfully',
            data: { profile },
        });
    });

    // Handle worker errors
    worker.on('error', (error) => {
        console.error('Worker Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user profile',
        });
    });

    // Handle worker exit
    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
            res.status(500).json({
                status: 'error',
                message: 'Worker process failed',
            });
        }
    });
};
