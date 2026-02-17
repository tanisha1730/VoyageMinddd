const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  place_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: [{
    type: String,
    trim: true
  }],
  location: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  opening_hours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  entry_fee: {
    type: Number,
    min: 0,
    default: 0
  },
  city: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  description: {
    type: String,
    trim: true
  },
  image_url: {
    type: String,
    trim: true
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient searching
placeSchema.index({ city: 1, country: 1 });
placeSchema.index({ tags: 1, rating: -1 });
placeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Place', placeSchema);