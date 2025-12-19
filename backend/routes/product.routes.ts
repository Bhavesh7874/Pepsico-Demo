import express from 'express';
import multer from 'multer';
const router = express.Router();
import {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    getProductImage
} from '../controllers/product.controller';
import { protect, admin } from '../middleware/auth.middleware';

// Multer Memory Storage for DB Buffer storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
            return cb(new Error('Please upload an image (jpg, jpeg, png, or webp)'));
        }
        cb(null, true);
    }
});

router.route('/')
    .get(getProducts)
    .post(protect, admin, upload.single('image'), createProduct);

router.route('/:id').get(getProductById).delete(protect, admin, deleteProduct);
router.get('/:id/image', getProductImage);

export default router;
