
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['customer', 'restaurant', 'delivery', 'admin'],
    default: 'customer',
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function () {
      return (this.role === 'customer' || this.role === 'admin') ? 'approved' : 'pending';
    },
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },

  licenseImage: {
    type: String, // for delivery personnel
  },

  restaurantDetails: {
    name: String,
    description: String,
    proofImage: String,
    isOpen: Boolean
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Create 2dsphere index for geolocation queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
