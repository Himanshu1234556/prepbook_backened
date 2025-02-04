const usersModel = require("../models/usersModel");

// Create User
const createUser = async (req, res) => {
    try {
        const user = await usersModel.createUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await usersModel.getAllUsers();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get User by ID
const getUserById = async (req, res) => {
    try {
        const user = await usersModel.getUserById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const user = await usersModel.updateUser(req.params.id, req.body);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const user = await usersModel.deleteUser(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };
