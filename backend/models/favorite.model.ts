import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
    user: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const favoriteSchema: Schema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
    },
    {
        timestamps: true,
    }
);

favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', favoriteSchema);
