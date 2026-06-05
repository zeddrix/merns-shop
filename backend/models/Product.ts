import mongoose, { type Document, type Model, Schema, type Types } from 'mongoose';

export interface IReview {
  name: string;
  rating: number;
  comment: string;
  user: Types.ObjectId;
}

export interface IReviewDocument extends IReview, Document {}

export interface IProductVariant {
  sku: string;
  label: string;
  storageGb?: number;
  screenInches?: number;
  ramGb?: number;
  listPrice: number;
  price: number;
  countInStock: number;
  image?: string;
}

export interface IProductVariantDocument extends IProductVariant, Document {}

export interface IProduct {
  user: Types.ObjectId;
  name: string;
  image: string;
  brand: string;
  category: string;
  subcategory: string;
  modelKey: string;
  releaseYear: number;
  condition: string;
  description: string;
  reviews: IReviewDocument[];
  rating: number;
  numReviews: number;
  variants: IProductVariantDocument[];
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

const ProductVariantSchema = new Schema<IProductVariantDocument>(
  {
    sku: { type: String, required: true },
    label: { type: String, required: true },
    storageGb: { type: Number },
    screenInches: { type: Number },
    ramGb: { type: Number },
    listPrice: { type: Number, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true, default: 0 },
    image: { type: String }
  },
  { _id: false }
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
    subcategory: {
      type: String,
      required: true
    },
    modelKey: {
      type: String,
      required: true
    },
    releaseYear: {
      type: Number,
      required: true
    },
    condition: {
      type: String,
      required: true,
      default: 'Like New'
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
    variants: {
      type: [ProductVariantSchema],
      required: true,
      validate: {
        validator: (v: IProductVariant[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one variant is required'
      }
    }
  },
  {
    timestamps: true
  }
);

ProductSchema.index({ brand: 1, category: 1, subcategory: 1 });
ProductSchema.index({ modelKey: 1 }, { unique: true });
ProductSchema.index({ 'variants.sku': 1 });

const Product = mongoose.model<IProductDocument, IProductModel>('Product', ProductSchema);

export default Product;
