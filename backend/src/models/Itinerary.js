const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  days: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  plan: [{
    day: {
      type: Number,
      required: true,
      min: 1
    },
    places: [{
      place_id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      start_time: {
        type: String,
        required: true
      },
      end_time: {
        type: String,
        required: true
      },
      category: [String],
      location: {
        lat: Number,
        lng: Number
      },
      rating: Number,
      entry_fee: Number,
      entry_fee_local: Number,
      entry_fee_formatted: String,
      currency: String,
      currency_symbol: String,
      pricing: mongoose.Schema.Types.Mixed,
      activity_type: String,
      tags: [String],
      notes: String
    }]
  }],
  weather_adjustments: [{
    day: Number,
    original_place_id: String,
    replacement_place_id: String,
    reason: String,
    adjusted_at: {
      type: Date,
      default: Date.now
    }
  }],
  // Simple weather notes from ML service
  weather_notes: [String],
  generated_on: {
    type: Date,
    default: Date.now
  },
  format: {
    type: String,
    enum: ['standard', 'detailed', 'compact'],
    default: 'standard'
  },
  is_public: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  // Real-time ML fields
  weather_forecast: [{
    day: Number,
    condition: String,
    temperature: Number,
    min_temp: Number,
    max_temp: Number,
    precipitation: Number,
    description: String,
    is_bad_weather: Boolean,
    humidity: Number,
    wind_speed: Number,
    uv_index: Number
  }],
  ml_powered: {
    type: Boolean,
    default: false
  },
  real_data_used: {
    type: Boolean,
    default: false
  },
  realtime_generated: {
    type: Boolean,
    default: false
  },
  original_query: String,
  parsed_query: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for efficient querying
itinerarySchema.index({ user_id: 1, created_at: -1 });
itinerarySchema.index({ destination: 1, is_public: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);