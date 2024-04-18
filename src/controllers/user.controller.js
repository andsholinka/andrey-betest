const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const db = require("../models");
const User = db.user;
require('dotenv').config();

const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(200).json({
            status: 200,
            message: "Success",
            data: user
        })
    } catch (error) {
        const errorMessages = {
            "11000": {
                userName: "Username already exists",
                accountNumber: "Account number already exists",
                emailAddress: "Email address already exists",
                identityNumber: "Identity number already exists",
            }
        };

        const errorCode = error.code.toString();
        const errorMessage = (errorMessages[errorCode] && errorMessages[errorCode][Object.keys(error.keyPattern)[0]]) || "Duplicate entry already exists";

        res.status(400).json({
            message: errorMessage
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            status: 200,
            message: "Success",
            data: users
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const {
            id
        } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: "Success",
            data: user
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getUserByAccountNumber = async (req, res) => {
    try {
        const {
            accountNumber
        } = req.params;

        const user = await User.findOne({
            accountNumber
        })

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: "Success",
            data: user
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getUserByIdentityNumber = async (req, res) => {
    try {
        const {
            identityNumber
        } = req.params;

        const user = await User.findOne({
            identityNumber
        })

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: "Success",
            data: user
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const {
            id
        } = req.params;

        const user = await User.findByIdAndUpdate(id, req.body, {
            useFindAndModify: false
        });

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            });
        }

        const updatedUser = await User.findById(id);
        res.status(200).json({
            status: 200,
            message: "User updated successfully",
            data: updatedUser
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const {
            id
        } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const generateToken = async (req, res) => {
    try {
        const {
            emailAddress
        } = req.body;

        const user = await User.findOne({
            emailAddress
        })

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            });
        }

        const token = jwt.sign({
            data: user
        }, process.env.SECRET_KEY, {
            expiresIn: '12h'
        });

        res.status(200).json({
            status: 200,
            message: "Success",
            data: token
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    getUserByAccountNumber,
    getUserByIdentityNumber,
    updateUser,
    deleteUser,
    generateToken
};