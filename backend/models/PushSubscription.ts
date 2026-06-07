import mongoose, { type Document, type Model, Schema, type Types } from 'mongoose';

export interface IPushSubscription {
  user: Types.ObjectId;
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface IPushSubscriptionDocument extends IPushSubscription, Document {
  _id: Types.ObjectId;
}

export type IPushSubscriptionModel = Model<IPushSubscriptionDocument>;

const PushSubscriptionSchema = new Schema<IPushSubscriptionDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    endpoint: {
      type: String,
      required: true,
      unique: true
    },
    expirationTime: {
      type: Number,
      default: null
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true }
    }
  },
  { timestamps: true }
);

const PushSubscription = mongoose.model<IPushSubscriptionDocument, IPushSubscriptionModel>(
  'PushSubscription',
  PushSubscriptionSchema
);

export default PushSubscription;
