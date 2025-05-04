const express = require('express');
const cors = require('cors');
require('dotenv').config();

const smsRoutes = require('./routes/smsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', smsRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
