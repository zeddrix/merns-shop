import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    mongoose.set('bufferCommands', false);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
};

export default connectDB;
