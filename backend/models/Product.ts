import mongoose, { type Document, type Model, Schema, type Types } from 'mongoose';

export interface IReview {
  name: string;
  rating: number;
  comment: string;
  user: Types.ObjectId;
}

export interface IReviewDocument extends IReview, Document {}

export interface IProduct {
  user: Types.ObjectId;
  name: string;
  image: string;
  brand: string;
  category: string;
  description: string;
  reviews: IReviewDocument[];
  rating: number;
  numReviews: number;
  price: number;
  countInStock: number;
}

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
}

export type IProductModel = Model<IProductDocument>;

const ReviewSchema = new Schema<IReviewDocument>(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    reviews: [ReviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model<IProductDocument, IProductModel>('Product', ProductSchema);

export default Product;
