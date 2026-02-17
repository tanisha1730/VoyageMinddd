const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  image_url: {
    type: String,
    required: true,
    trim: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  caption: {
    type: String,
    trim: true
  },
  location: {
    place_id: String,
    name: String,
    lat: Number,
    lng: Number
  },
  tags: [{
    type: String,
    trim: true
  }],
  weather: {
    type: String,
    trim: true
  },
  layout: {
    type: String,
    enum: ['Polaroid', 'Magazine', 'Collage'],
    default: 'Magazine',
    trim: true
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  is_public: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
memorySchema.index({ user_id: 1, created_on: -1 });
memorySchema.index({ tags: 1, is_public: 1 });

module.exports = mongoose.model('Memory', memorySchema);