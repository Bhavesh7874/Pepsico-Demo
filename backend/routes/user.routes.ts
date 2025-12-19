import express from 'express';
const router = express.Router();
import { updateUserProfile, getUserProfile } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;
