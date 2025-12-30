import { Request, Response } from 'express';
import User from '../models/user.model';
import * as bcrypt from 'bcryptjs';

interface AuthRequest extends Request {
    user?: any;
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user._id);

    if (user) {
        console.log(`[BACKEND] [USER] [${new Date().toISOString()}] Updating profile for user: ${user.email}`);
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            console.log(`[BACKEND] [USER] [${new Date().toISOString()}] Changing password for user: ${user.email}`);
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();
        console.log(`[BACKEND] [USER] [${new Date().toISOString()}] Profile updated successfully: ${user.email}`);

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response) => {
    console.log(`[BACKEND] [USER] [${new Date().toISOString()}] Fetching profile for user ID: ${req.user._id}`);
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
