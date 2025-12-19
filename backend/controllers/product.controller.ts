import { Request, Response } from 'express';
import Product from '../models/product.model';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
    const products = await Product.find({});
    res.json(products);
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create product with image upload
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req: Request, res: Response) => {
    const { name, price, description, stock } = req.body;

    const productData: any = {
        name,
        price,
        description,
        stock,
    };

    if (req.file) {
        productData.image = {
            data: req.file.buffer,
            contentType: req.file.mimetype,
        };
        // Reset placeholder if actual image is uploaded
        productData.imageUrl = '';
    }

    const product = new Product(productData);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
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
