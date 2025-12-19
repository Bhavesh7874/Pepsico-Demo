import express from 'express';
const router = express.Router();
import {
    addOrderItems,
    getOrderById,
    getMyOrders,
    createPaymentIntent,
} from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/payment-intent').post(protect, createPaymentIntent);
router.route('/:id').get(protect, getOrderById);

export default router;
