import { Request, Response } from "express";
import Stripe from "stripe";
import Order from "../models/order.model";

interface AuthRequest extends Request {
  user?: any;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// @desc    Create Stripe Payment Intent
// @route   POST /api/orders/payment-intent
// @access  Private
export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;
  console.log(`[BACKEND] [ORDER] [${new Date().toISOString()}] Creating payment intent for amount: ${amount}`);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amounts in cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`[BACKEND] [ORDER] [${new Date().toISOString()}] Payment intent created: ${paymentIntent.id}`);
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error(`[BACKEND] [ORDER] [${new Date().toISOString()}] Payment intent failed: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req: AuthRequest, res: Response) => {
  const { orderItems, paymentMethod, totalPrice, paymentResult } = req.body;

  if (orderItems && orderItems.length === 0) {
    console.warn(`[BACKEND] [ORDER] [${new Date().toISOString()}] Order creation failed: No items`);
    res.status(400).json({ message: "No order items" });
    return;
  } else {
    console.log(`[BACKEND] [ORDER] [${new Date().toISOString()}] Creating new order for user: ${req.user._id}`);
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      paymentMethod,
      totalAmount: totalPrice,
      paymentResult,
      isPaid: !!paymentResult,
      paidAt: paymentResult ? new Date() : undefined,
    });

    const createdOrder = await order.save();
    console.log(`[BACKEND] [ORDER] [${new Date().toISOString()}] Order created successfully: ${createdOrder._id}`);
    res.status(201).json(createdOrder);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  console.log(`[BACKEND] [ORDER] [${new Date().toISOString()}] Fetching orders for user: ${req.user._id}`);
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};
