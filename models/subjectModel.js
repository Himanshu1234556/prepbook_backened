const pool = require('../config/db');
const redis = require('../config/redisClient'); // Import your Redis client
const NodeCache = require('node-cache'); // Import node-cache

const localCache = new NodeCache(); // Initialize node-cache

// Set this flag to `false` to bypass cache
const useCache = false; // Change this to true if you want to use caching

// Fetch the list of subjects based on user details
const fetchSubjectsForUser = async (userId) => {
    try {
        // Query to get user data (branch_id, semester_id, course_id, subjects)
        const userQuery = `
            SELECT branch_id, semester_id, course_id, subjects
            FROM users
            WHERE id = $1
        `;
        const userResult = await pool.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const { branch_id, semester_id, course_id, subjects: userSubjects } = userResult.rows[0];
        const userSubjectsArray = userSubjects || [];

        // Create a cache key based on the user profile
        const cacheKey = `subjects:${branch_id}:${semester_id}:${course_id}`;

        let subjects;

        // Cache lookup logic
        if (useCache) {
            // Check in local cache first
            subjects = localCache.get(cacheKey);

            if (!subjects) {
                // If not in local cache, check Redis
                const cachedSubjects = await redis.get(cacheKey);
                if (cachedSubjects) {
                    subjects = JSON.parse(cachedSubjects);
                    localCache.set(cacheKey, subjects, 3600); // Set to local cache as fallback
                }
            }
        }

        if (!subjects) {
            // If no cache found, fetch subjects from DB
            const branchIdStr = String(branch_id);
            const semesterIdStr = String(semester_id);
            const courseIdStr = String(course_id);

            // Query to fetch subjects matching the user's profile
            const subjectQuery = `
                SELECT id, name, code, branch_ids, year_ids, course_ids
                FROM subjects
                WHERE branch_ids @> $1::jsonb
                AND year_ids @> $2::jsonb
                AND course_ids @> $3::jsonb
            `;
            const subjectResult = await pool.query(subjectQuery, [
                JSON.stringify([branchIdStr]),
                JSON.stringify([semesterIdStr]),
                JSON.stringify([courseIdStr])
            ]);

            const matchedSubjects = subjectResult.rows.map(subject => {
                const { branch_ids, year_ids, course_ids, ...subjectWithoutIds } = subject;
                return {
                    ...subjectWithoutIds,
                    selected: userSubjectsArray.includes(subject.id)
                };
            });

            // Fetch all subjects excluding those already matched
            const allSubjectsQuery = `SELECT id, name, code FROM subjects WHERE course_ids @> $1::jsonb`;
            const allSubjectsResult = await pool.query(allSubjectsQuery, [
                JSON.stringify([courseIdStr])
            ]);

            const allSubjects = allSubjectsResult.rows.filter(subject => 
                !matchedSubjects.some(ms => ms.id === subject.id)
            ).map(subject => ({
                ...subject,
                selected: userSubjectsArray.includes(subject.id)
            }));

            // Prioritize matched subjects at the top
            subjects = [...matchedSubjects, ...allSubjects];

            // Store in Redis and local cache
            const cacheTTL = 3600;
            await redis.set(cacheKey, JSON.stringify(subjects), 'EX', cacheTTL);
            localCache.set(cacheKey, subjects, cacheTTL);
        }

        return subjects;
    } catch (error) {
        throw new Error('Error fetching subjects: ' + error.message);
    }
};

module.exports = { fetchSubjectsForUser };
