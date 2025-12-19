import express from 'express';
const router = express.Router();
import {
    toggleFavorite,
    getMyFavorites,
} from '../controllers/favorite.controller';
import { protect } from '../middleware/auth.middleware';

router.route('/').get(protect, getMyFavorites);
router.route('/toggle').post(protect, toggleFavorite);

export default router;
