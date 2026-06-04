import mongoose, { type Document, type Model, Schema, type Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export type IUserModel = Model<IUserDocument>;

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    timestamps: true
  }
);

UserSchema.methods.matchPassword = async function (
  this: IUserDocument,
  enteredPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export default User;
