const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function clearUsers() {
  try {
    console.log('Connecting to MongoDB...');
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB');
    }

    console.log('Clearing all test users...');
    const result = await User.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} users!`);
    
    if (process.argv.includes('--standalone')) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
    
  } catch (error) {
    console.error('❌ Failed to clear users:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  clearUsers();
}

module.exports = { clearUsers };