import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected", () => console.log("✅ DB connected"));
    mongoose.connection.on("error", (err) => console.log("❌ DB error:", err));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connection established."); 
};

export default connectDB;
