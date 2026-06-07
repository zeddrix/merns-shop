import mongoose, { type Document, type Model, Schema, type Types } from 'mongoose';

export interface INotificationPreference {
  user: Types.ObjectId;
  pushEnabled: boolean;
  orderPaid: boolean;
  orderDelivered: boolean;
}

export interface INotificationPreferenceDocument extends INotificationPreference, Document {
  _id: Types.ObjectId;
}

export type INotificationPreferenceModel = Model<INotificationPreferenceDocument>;

const NotificationPreferenceSchema = new Schema<INotificationPreferenceDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true
    },
    pushEnabled: {
      type: Boolean,
      required: true,
      default: false
    },
    orderPaid: {
      type: Boolean,
      required: true,
      default: true
    },
    orderDelivered: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  { timestamps: true }
);

const NotificationPreference = mongoose.model<
  INotificationPreferenceDocument,
  INotificationPreferenceModel
>('NotificationPreference', NotificationPreferenceSchema);

export default NotificationPreference;
