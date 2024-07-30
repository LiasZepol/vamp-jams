import mongoose from 'mongoose';

const connectDB = async () => {
    const uri = process.env.MONGODB_URI; // Ensure this is set correctly
    if (!uri) {
        throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

export default connectDB;
