const pool = require('../config/db');
const NodeCache = require('node-cache');

// Initialize cache with a default TTL (time to live) of 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

const fetchData = async () => {
    const coursesQuery = `
        SELECT c.id AS course_id, c.name AS course_name, c.code AS course_code, 
               b.id AS branch_id, b.name AS branch_name, b.course_id AS branch_course_id,
               s.id AS semester_id, s.name AS semester_name, s.course_id AS semester_course_id,
               u.id AS university_id, u.name AS university_name, u.code AS university_code,
               col.id AS college_id, col.name AS college_name, col.university_id AS college_university_id
        FROM course c
        LEFT JOIN branches b ON b.course_id @> to_jsonb(c.id::text)  -- Use to_jsonb with text
        LEFT JOIN semesters s ON s.course_id @> to_jsonb(c.id::text)  -- Use to_jsonb with text
        LEFT JOIN universities u ON u.id IS NOT NULL -- Replace this with a valid condition if necessary
        LEFT JOIN colleges col ON col.university_id = u.id ORDER BY c.id ASC, b.id ASC, s.id ASC, u.id ASC, col.id ASC
    `;

    const result = await pool.query(coursesQuery);
    return result.rows;
};

exports.getCoursesDropdown = async (req, res) => {
    try {
        // Check if we have cached data
        const cachedData = cache.get("coursesDropdown");

        if (cachedData) {
            console.log("Using cached data...");
            return res.status(200).json({
                status: 'success',
                message: 'Courses dropdown fetched from cache',
                data: cachedData
            });
        }

        console.log("Fetching data from database...");
        const data = await fetchData();

        // Process the data into the desired format
        const coursesMap = {};

        data.forEach(row => {
            const { course_id, course_name, branch_id, branch_name, semester_id, semester_name, university_id, university_name, college_id, college_name } = row;

            // Initialize course entry
            if (!coursesMap[course_id]) {
                coursesMap[course_id] = {
                    id: course_id,
                    name: course_name,
                    branches: [],
                    semesters: [],
                    universities: [],
                };
            }

            // Add branches (avoid duplicates)
            if (branch_id && !coursesMap[course_id].branches.some(b => b.id === branch_id)) {
                coursesMap[course_id].branches.push({
                    id: branch_id,
                    name: branch_name,
                });
            }

            // Add semesters (avoid duplicates)
            if (semester_id && !coursesMap[course_id].semesters.some(s => s.id === semester_id)) {
                coursesMap[course_id].semesters.push({
                    id: semester_id,
                    name: semester_name,
                });
            }

            // Add universities (avoid duplicates)
            if (university_id) {
                let university = coursesMap[course_id].universities.find(u => u.id === university_id);
                if (!university) {
                    university = {
                        id: university_id,
                        name: university_name,
                        colleges: [],
                    };
                    coursesMap[course_id].universities.push(university);
                }

                // Add colleges (avoid duplicates)
                if (college_id && !university.colleges.some(c => c.id === college_id)) {
                    university.colleges.push({
                        id: college_id,
                        name: college_name,
                    });
                }
            }
        });

        const response = {
            courses: Object.values(coursesMap),
        };

        // Cache the response
        cache.set("coursesDropdown", response);

        res.status(200).json({
            status: 'success',
            message: 'Courses dropdown fetched successfully',
            data: response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            data: null
        });
    }
};
