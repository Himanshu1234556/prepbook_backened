const express = require('express');
const cors = require('cors'); // Import the cors middleware
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const assetRoutes = require('./routes/assetRoutes');
const appRoutes = require('./routes/appRoutes');
const dataRoutes = require('./routes/dataRoutes');
const dropdownRoutes = require('./routes/dropdownRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
// const freeResourceCRUD = require('./routes/freeResourceCategoryRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Apply CORS middleware
app.use(cors()); // Allow all origins by default
app.options('*', cors()); // Handle preflight requests for all routes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define your routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1', fileRoutes);
app.use('/api/v1', assetRoutes);
app.use('/api/v1', appRoutes);
app.use('/api/v1', dataRoutes);
app.use('/api/v1', subjectRoutes);
app.use('/api/v1/dropdown', dropdownRoutes);
// admin routes
// app.use('/api/ResourceCrud', freeResourceCRUD);

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 3339;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
