import mongoose from "mongoose";

const connectMongo = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
    );
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB - Database: functions');
    return connection;
  } catch (error) {
    console.error("Mongoose Connection Error:", error);
    throw error;
  }
};

export default connectMongo;
