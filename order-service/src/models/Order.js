const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        notes: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,                       
      required: true,
      default: 250,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "unpaid"], 
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card"],

      default: "cod",

    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",      // Added "confirmed" here
        "accepted",
        "preparing",
        "ready",
        "onTheWay",
        "delivered",
        "cancelled",
        "rejected"
      ],
      default: "pending",
    },
    prepTime: {                     
      type: Number,                  
      default: 0,
    },
    rejectionReason: {
      type: String,
      default: "",
    },    
    deliveryAddress: {
      type: String,
      required: true,
    },
    deliveryLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
    },
    restaurantLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],

    },
    assignedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: false,
      default: null,
      sparse: true
    }
  },
  { timestamps: true }
);

orderSchema.index({ orderStatus: 1, assignedDriverId: 1 });
orderSchema.index({ deliveryLocation: '2dsphere' });
orderSchema.index({ restaurantLocation: '2dsphere' });

module.exports = mongoose.model("Order", orderSchema);
