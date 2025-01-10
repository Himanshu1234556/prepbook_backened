const pool = require('../config/db');
const redis = require('../config/redisClient'); // Import your Redis client
const NodeCache = require('node-cache'); // Import node-cache

const localCache = new NodeCache(); // Initialize node-cache

// Set this flag to `false` to bypass cache
const useCache = false; // Set this to false to bypass cache

// Fetch the list of subjects based on user details
const fetchSubjectsForUser = async (userId) => {
    try {
        // Query to get user data (branch_id, semester_id, and course_id)
        const userQuery = `
            SELECT branch_id, semester_id, course_id
            FROM users
            WHERE id = $1
        `;
        const userResult = await pool.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const { branch_id, semester_id, course_id } = userResult.rows[0];

        // Create a cache key based on the user profile
        const cacheKey = `subjects:${branch_id}:${semester_id}:${course_id}`;

        // Check local cache if useCache is true
        let subjects;
        if (useCache) {
            subjects = localCache.get(cacheKey);
            if (!subjects) {
                // If not in local cache, check Redis
                const cachedSubjects = await redis.get(cacheKey);
                if (cachedSubjects) {
                    subjects = JSON.parse(cachedSubjects);
                    // Store in local cache for faster access next time
                    localCache.set(cacheKey, subjects, 3600); // Cache for 1 hour
                } else {
                    // Fetch subjects from the database
                    const branchIdStr = String(branch_id);
                    const semesterIdStr = String(semester_id);
                    const courseIdStr = String(course_id);

                    // Query to fetch the subjects based on branch, semester, and course
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

                    // Map matched subjects with `selected: true`
                    const matchedSubjects = subjectResult.rows.map(subject => {
                        const { branch_ids, year_ids, course_ids, ...subjectWithoutIds } = subject;
                        return {
                            ...subjectWithoutIds,
                            selected: true
                        };
                    });

                    // Limit matched subjects to 10
                    const limitedMatchedSubjects = matchedSubjects.slice(0, 10);

                    // Query to fetch all other subjects (not necessarily matching)
                    const allSubjectsQuery = `
                        SELECT id, name, code, branch_ids, year_ids, course_ids
                        FROM subjects
                    `;

                    const allSubjectsResult = await pool.query(allSubjectsQuery);

                    const allSubjects = allSubjectsResult.rows.map(subject => {
                        const { branch_ids, year_ids, course_ids, ...subjectWithoutIds } = subject;
                        const isSelected = limitedMatchedSubjects.some(s => s.id === subject.id);
                        return {
                            ...subjectWithoutIds,
                            selected: isSelected
                        };
                    });

                    subjects = allSubjects;

                    // Store the result in Redis and local cache if useCache is true
                    const cacheTTL = 3600; // Cache TTL in seconds (1 hour)
                    await redis.set(cacheKey, JSON.stringify(subjects), 'EX', cacheTTL);
                    localCache.set(cacheKey, subjects, cacheTTL);
                }
            }
        } else {
            // Skip cache and fetch subjects directly
            const branchIdStr = String(branch_id);
            const semesterIdStr = String(semester_id);
            const courseIdStr = String(course_id);

            // Query to fetch the subjects based on branch, semester, and course
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

            // Map matched subjects with `selected: true`
            const matchedSubjects = subjectResult.rows.map(subject => {
                const { branch_ids, year_ids, course_ids, ...subjectWithoutIds } = subject;
                return {
                    ...subjectWithoutIds,
                    selected: true
                };
            });

            // Limit matched subjects to 10
            const limitedMatchedSubjects = matchedSubjects.slice(0, 10);

            // Query to fetch all other subjects (not necessarily matching)
            const allSubjectsQuery = `
                SELECT id, name, code, branch_ids, year_ids, course_ids
                FROM subjects
            `;

            const allSubjectsResult = await pool.query(allSubjectsQuery);

            const allSubjects = allSubjectsResult.rows.map(subject => {
                const { branch_ids, year_ids, course_ids, ...subjectWithoutIds } = subject;
                const isSelected = limitedMatchedSubjects.some(s => s.id === subject.id);
                return {
                    ...subjectWithoutIds,
                    selected: isSelected
                };
            });

            subjects = allSubjects;
        }

        return subjects;
    } catch (error) {
        throw new Error('Error fetching subjects: ' + error.message);
    }
};

module.exports = { fetchSubjectsForUser };
