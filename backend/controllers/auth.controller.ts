import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    console.log(`[BACKEND] [AUTH] [${new Date().toISOString()}] Registering user: ${email}`);

    const userExists = await User.findOne({ email });

    if (userExists) {
        console.warn(`[BACKEND] [AUTH] [${new Date().toISOString()}] Registration failed: User ${email} already exists`);
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
    });

    if (user) {
        console.log(`[BACKEND] [AUTH] [${new Date().toISOString()}] User registered successfully: ${email}`);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken((user._id as any).toString()),
        });
    } else {
        console.error(`[BACKEND] [AUTH] [${new Date().toISOString()}] Registration failed: Invalid user data for ${email}`);
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(`[BACKEND] [AUTH] [${new Date().toISOString()}] Login attempt: ${email}`);

    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
        console.log(`[BACKEND] [AUTH] [${new Date().toISOString()}] Login successful: ${email}`);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken((user._id as any).toString()),
        });
    } else {
        console.warn(`[BACKEND] [AUTH] [${new Date().toISOString()}] Login failed: Invalid credentials for ${email}`);
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};
