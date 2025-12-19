import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    price: number;
    description: string;
    imageUrl?: string;
    image?: {
        data: Buffer;
        contentType: string;
    };
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a product name'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        imageUrl: {
            type: String,
            default: 'https://via.placeholder.com/150'
        },
        image: {
            data: Buffer,
            contentType: String
        },
        stock: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IProduct>('Product', productSchema);
