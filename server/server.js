import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkMiddleware } from "@clerk/express";

const app = express();

// Connect to DB
await connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // This must come before clerkMiddleware
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => res.send("API WORKING"));
app.post('/clerk', clerkWebhooks);
app.use('/api/educator', educatorRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
