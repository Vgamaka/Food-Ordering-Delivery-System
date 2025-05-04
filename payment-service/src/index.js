const express = require('express');
const cors = require('cors');
require('dotenv').config();

const payhereRoutes = require('./routes/payhereRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', payhereRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`💳 Payment Service running on port ${PORT}`);
});
