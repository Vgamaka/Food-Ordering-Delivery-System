const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


require('dotenv').config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      // requests like POSTMAN / server-to-server requests — allow
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'development') {
      // Development mode — allow any origin
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      // Origin allowed
      return callback(null, true);
    } else {
      // Origin not allowed
      return callback(new Error('CORS policy: This origin is not allowed'), false);
    }
  },
  credentials: true
}));

app.use(express.json());



const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI;

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection failed:", err.message));

// ✅ Serve uploaded license images statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ✅ Routes
app.use('/api/driver', require('./routes/driver'));

app.listen(PORT, () => {
  console.log(`🚚 Delivery Service running on port ${PORT}`);
});
