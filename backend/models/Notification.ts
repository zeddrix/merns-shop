import mongoose, { type Document, type Model, Schema, type Types } from 'mongoose';

export type NotificationType = 'order_paid' | 'order_delivered';

export interface INotification {
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  url: string;
  orderId?: Types.ObjectId;
  read: boolean;
}

export interface INotificationDocument extends INotification, Document {
  _id: Types.ObjectId;
}

export type INotificationModel = Model<INotificationDocument>;

const NotificationSchema = new Schema<INotificationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['order_paid', 'order_delivered']
    },
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    read: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotificationDocument, INotificationModel>(
  'Notification',
  NotificationSchema
);

export default Notification;
