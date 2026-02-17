const mongoose = require('mongoose');
require('dotenv').config();

const Place = require('./src/models/Place');

const indiaPlaces = [
  {
    place_id: 'india_taj_mahal',
    name: 'Taj Mahal',
    category: ['monument', 'unesco_world_heritage'],
    location: { lat: 27.1751, lng: 78.0421 },
    rating: 4.6,
    opening_hours: {
      monday: { open: '06:00', close: '19:00' },
      tuesday: { open: '06:00', close: '19:00' },
      wednesday: { open: '06:00', close: '19:00' },
      thursday: { open: '06:00', close: '19:00' },
      friday: { open: '06:00', close: '19:00' },
      saturday: { open: '06:00', close: '19:00' },
      sunday: { open: '06:00', close: '19:00' }
    },
    entry_fee: 50,
    city: 'Agra',
    country: 'India',
    tags: ['iconic', 'architecture', 'love', 'marble', 'mughal'],
    description: 'Iconic white marble mausoleum and symbol of love'
  },
  {
    place_id: 'india_red_fort',
    name: 'Red Fort',
    category: ['fort', 'historical_site'],
    location: { lat: 28.6562, lng: 77.2410 },
    rating: 4.3,
    opening_hours: {
      monday: { open: '09:30', close: '16:30' },
      tuesday: { open: '09:30', close: '16:30' },
      wednesday: { open: '09:30', close: '16:30' },
      thursday: { open: '09:30', close: '16:30' },
      friday: { open: '09:30', close: '16:30' },
      saturday: { open: '09:30', close: '16:30' },
      sunday: { open: '09:30', close: '16:30' }
    },
    entry_fee: 35,
    city: 'Delhi',
    country: 'India',
    tags: ['historical', 'mughal', 'fort', 'red_sandstone'],
    description: 'Historic fortified palace and UNESCO World Heritage Site'
  },
  {
    place_id: 'india_gateway_of_india',
    name: 'Gateway of India',
    category: ['monument', 'tourist_attraction'],
    location: { lat: 18.9220, lng: 72.8347 },
    rating: 4.2,
    opening_hours: {
      monday: { open: '00:00', close: '23:59' },
      tuesday: { open: '00:00', close: '23:59' },
      wednesday: { open: '00:00', close: '23:59' },
      thursday: { open: '00:00', close: '23:59' },
      friday: { open: '00:00', close: '23:59' },
      saturday: { open: '00:00', close: '23:59' },
      sunday: { open: '00:00', close: '23:59' }
    },
    entry_fee: 0,
    city: 'Mumbai',
    country: 'India',
    tags: ['iconic', 'colonial', 'waterfront', 'free'],
    description: 'Iconic arch monument overlooking the Arabian Sea'
  },
  {
    place_id: 'india_hawa_mahal',
    name: 'Hawa Mahal',
    category: ['palace', 'historical_site'],
    location: { lat: 26.9239, lng: 75.8267 },
    rating: 4.1,
    opening_hours: {
      monday: { open: '09:00', close: '16:30' },
      tuesday: { open: '09:00', close: '16:30' },
      wednesday: { open: '09:00', close: '16:30' },
      thursday: { open: '09:00', close: '16:30' },
      friday: { open: '09:00', close: '16:30' },
      saturday: { open: '09:00', close: '16:30' },
      sunday: { open: '09:00', close: '16:30' }
    },
    entry_fee: 50,
    city: 'Jaipur',
    country: 'India',
    tags: ['palace', 'pink_city', 'architecture', 'rajasthani'],
    description: 'Palace of Winds with intricate lattice work'
  },
  {
    place_id: 'india_lotus_temple',
    name: 'Lotus Temple',
    category: ['temple', 'religious_site'],
    location: { lat: 28.5535, lng: 77.2588 },
    rating: 4.4,
    opening_hours: {
      monday: { open: '09:00', close: '19:00' },
      tuesday: { open: '09:00', close: '19:00' },
      wednesday: { open: '09:00', close: '19:00' },
      thursday: { open: '09:00', close: '19:00' },
      friday: { open: '09:00', close: '19:00' },
      saturday: { open: '09:00', close: '19:00' },
      sunday: { open: '09:00', close: '19:00' }
    },
    entry_fee: 0,
    city: 'Delhi',
    country: 'India',
    tags: ['modern', 'architecture', 'peaceful', 'free', 'bahai'],
    description: 'Modern architectural marvel shaped like a lotus flower'
  },
  {
    place_id: 'india_amber_fort',
    name: 'Amber Fort',
    category: ['fort', 'palace'],
    location: { lat: 26.9855, lng: 75.8513 },
    rating: 4.5,
    opening_hours: {
      monday: { open: '08:00', close: '17:30' },
      tuesday: { open: '08:00', close: '17:30' },
      wednesday: { open: '08:00', close: '17:30' },
      thursday: { open: '08:00', close: '17:30' },
      friday: { open: '08:00', close: '17:30' },
      saturday: { open: '08:00', close: '17:30' },
      sunday: { open: '08:00', close: '17:30' }
    },
    entry_fee: 100,
    city: 'Jaipur',
    country: 'India',
    tags: ['fort', 'palace', 'rajasthani', 'hilltop', 'elephant_ride'],
    description: 'Majestic fort palace with stunning architecture'
  }
];

async function seedIndiaPlaces() {
  try {
    console.log('Connecting to MongoDB...');
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB');
    }

    console.log('Adding India places...');
    
    // Add places one by one to avoid duplicates
    for (const place of indiaPlaces) {
      await Place.findOneAndUpdate(
        { place_id: place.place_id },
        place,
        { upsert: true, new: true }
      );
    }
    
    console.log(`✅ Successfully added ${indiaPlaces.length} India places!`);
    
    if (process.argv.includes('--standalone')) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
    
  } catch (error) {
    console.error('❌ Failed to seed India places:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  seedIndiaPlaces();
}

module.exports = { seedIndiaPlaces, indiaPlaces };