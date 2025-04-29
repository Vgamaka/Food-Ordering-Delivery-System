const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  vehicleNumber: String,
  password: String,
  licensePhoto: {
    type: String,
    required: false,
  },
  
  availability: { type: Boolean, default: true },
  currentLocation: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Driver', DriverSchema);
