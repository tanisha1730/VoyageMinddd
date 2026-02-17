const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  preferences: {
    budget: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    interests: [{
      type: String,
      trim: true
    }]
  },
  saved_itineraries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary'
  }],
  digital_memories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memory'
  }],
  refresh_tokens: [{
    token_hash: String,
    expires_at: Date
  }],
  consent_given: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password_hash;
  delete user.refresh_tokens;
  return user;
};

module.exports = mongoose.model('User', userSchema);