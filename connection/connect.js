
import mongoose from "mongoose"
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_URL);
        console.log('Database connected');
    } catch (err) {
        console.error('Database connection error', err);
        process.exit(1);
    }
};

export default connectDB;

