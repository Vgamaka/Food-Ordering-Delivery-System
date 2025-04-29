const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // ✅ Now optional for Google login
  googleId: { type: String }, // ✅ Add Google ID
  profilePicture: { type: String }, // ✅ Add profile picture from Google

  phone: { type: String },
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
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [79.8612, 6.9271]
    }
  },
  licenseImage: { type: String },
  restaurantDetails: {
    name: String,
    description: String,
    proofImage: String,
    isOpen: Boolean,
  },
  createdAt: { type: Date, default: Date.now },
});

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
