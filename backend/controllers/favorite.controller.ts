import { Request, Response } from 'express';
import Favorite from '../models/favorite.model';

interface AuthRequest extends Request {
    user?: any;
}

// @desc    Toggle favorite
// @route   POST /api/favorites/toggle
// @access  Private
export const toggleFavorite = async (req: AuthRequest, res: Response) => {
    const { productId } = req.body;
    const userId = req.user._id;

    const favorite = await Favorite.findOne({ user: userId, product: productId });

    if (favorite) {
        await Favorite.deleteOne({ _id: favorite._id });
        res.json({ message: 'Removed from favorites' });
    } else {
        const newFavorite = new Favorite({
            user: userId,
            product: productId,
        });
        await newFavorite.save();
        res.status(201).json({ message: 'Added to favorites' });
    }
};

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
export const getMyFavorites = async (req: AuthRequest, res: Response) => {
    const favorites = await Favorite.find({ user: req.user._id }).populate('product');
    res.json(favorites);
};
