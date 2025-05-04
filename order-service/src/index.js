const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const orderRoutes = require("./routes/orderRoutes");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create app
const app = express();

// Setup dynamic CORS
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true); // Allow server-to-server or Postman
    }
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true); // Allow any origin in development
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true); // Allow if matched
    } else {
      return callback(new Error('CORS policy: This origin is not allowed'), false);
    }
  },
  credentials: true
}));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/orders", orderRoutes);

// Health Check Route
app.get("/", (req, res) => res.send("✅ Order Service is running"));

// Request Logger Middleware (optional, nice for debugging)
app.use((req, res, next) => {
  console.log(`🌐 Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 Order Service running at http://localhost:${PORT}`);
});
