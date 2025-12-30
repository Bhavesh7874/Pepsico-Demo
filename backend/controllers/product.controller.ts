import { Request, Response } from 'express';
import Product from '../models/product.model';
import { redisService } from '../services/redis.service';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
    console.log(`[BACKEND] [PRODUCT] [${new Date().toISOString()}] Fetching all products`);
    const products = await Product.find({});
    res.json(products);
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
    console.log(`[BACKEND] [PRODUCT] [${new Date().toISOString()}] Fetching product by ID: ${req.params.id}`);
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        console.warn(`[BACKEND] [PRODUCT] [${new Date().toISOString()}] Product not found: ${req.params.id}`);
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create product with image upload
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req: Request, res: Response) => {
    const { name, price, description, stock } = req.body;
    console.log(`[BACKEND] [PRODUCT] [${new Date().toISOString()}] Creating new product: ${name}`);

    const productData: any = {
        name,
        price,
        description,
        stock,
    };

    if (req.file) {
        console.log(`[BACKEND] [PRODUCT] [${new Date().toISOString()}] Uploading image for product: ${name}`);
        productData.image = {
            data: req.file.buffer,
            contentType: req.file.mimetype,
        };
        // Reset placeholder if actual image is uploaded
        productData.imageUrl = '';
    }

    const product = new Product(productData);
    const createdProduct = await product.save();
    console.log(`[BACKEND] [PRODUCT] [${new Date().toISOString()}] Product created successfully: ${createdProduct._id}`);

    await redisService.del('cache:/api/products');
    console.log(`[BACKEND] [PRODUCT] [${new Date().toISOString()}] Cache invalidated for products list`);

    res.status(201).json(createdProduct);
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req: Request, res: Response) => {
    console.log(`[BACKEND] [PRODUCT] [${new Date().toISOString()}] Deleting product: ${req.params.id}`);
    const product = await Product.findById(req.params.id);

    if (product) {
        await Product.deleteOne({ _id: product._id });
        console.log(`[BACKEND] [PRODUCT] [${new Date().toISOString()}] Product removed: ${product._id}`);

        await redisService.del('cache:/api/products');
        await redisService.del(`cache:/api/products/${req.params.id}`);
        console.log(`[BACKEND] [PRODUCT] [${new Date().toISOString()}] Cache invalidated for deleted product`);

        res.json({ message: 'Product removed' });
    } else {
        console.warn(`[BACKEND] [PRODUCT] [${new Date().toISOString()}] Deletion failed, product not found: ${req.params.id}`);
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Serve product image
// @route   GET /api/products/:id/image
// @access  Public
export const getProductImage = async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product && product.image && product.image.data) {
        res.set('Content-Type', product.image.contentType);
        return res.send(product.image.data);
    } else {
        res.status(404).json({ message: 'Image not found' });
    }
};
