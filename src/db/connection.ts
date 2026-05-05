import {connect, disconnect} from "mongoose"

export const connectDB = async () => {
    const mongoURL = process.env.MONGO_URL;
    if (!mongoURL) {
        console.error("MongoDB connection URL is not defined in environment variables.");
        return;
    }
    try {
        await connect(mongoURL);
        console.log("Connected to MongoDB successfully.");
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export const disconnectDB = async () => {
    try {
        await disconnect(); 
        console.log("Disconnected from MongoDB successfully.");
    }
    catch (error) {
        console.error("Error disconnecting from MongoDB:", error);
    }   
}