
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

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

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send(' Auth Service is running');
});
app.use('/uploads', express.static('uploads'));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Auth Service running on http://localhost:${PORT}`);
});
