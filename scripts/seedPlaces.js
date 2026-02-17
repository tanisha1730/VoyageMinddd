const mongoose = require('mongoose');
require('dotenv').config();

// Import the Place model
const Place = require('../backend/src/models/Place');

const samplePlaces = [
  // Paris, France
  {
    place_id: 'paris_eiffel_tower',
    name: 'Eiffel Tower',
    category: ['tourist_attraction', 'monument'],
    location: { lat: 48.8584, lng: 2.2945 },
    rating: 4.6,
    opening_hours: {
      monday: { open: '09:30', close: '23:45' },
      tuesday: { open: '09:30', close: '23:45' },
      wednesday: { open: '09:30', close: '23:45' },
      thursday: { open: '09:30', close: '23:45' },
      friday: { open: '09:30', close: '23:45' },
      saturday: { open: '09:30', close: '23:45' },
      sunday: { open: '09:30', close: '23:45' }
    },
    entry_fee: 29,
    city: 'Paris',
    country: 'France',
    tags: ['iconic', 'architecture', 'views', 'romantic'],
    description: 'Iconic iron lattice tower and symbol of Paris',
    last_updated: new Date()
  },
  {
    place_id: 'paris_louvre',
    name: 'Louvre Museum',
    category: ['museum', 'art_gallery'],
    location: { lat: 48.8606, lng: 2.3376 },
    rating: 4.7,
    opening_hours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '21:45' },
      wednesday: { open: '09:00', close: '21:45' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '21:45' },
      saturday: { open: '09:00', close: '18:00' },
      sunday: { open: '09:00', close: '18:00' }
    },
    entry_fee: 17,
    city: 'Paris',
    country: 'France',
    tags: ['art', 'culture', 'history', 'mona_lisa'],
    description: 'World\'s largest art museum and historic monument',
    last_updated: new Date()
  },
  {
    place_id: 'paris_notre_dame',
    name: 'Notre-Dame Cathedral',
    category: ['church', 'historical_site'],
    location: { lat: 48.8530, lng: 2.3499 },
    rating: 4.5,
    opening_hours: {
      monday: { open: '08:00', close: '18:45' },
      tuesday: { open: '08:00', close: '18:45' },
      wednesday: { open: '08:00', close: '18:45' },
      thursday: { open: '08:00', close: '18:45' },
      friday: { open: '08:00', close: '18:45' },
      saturday: { open: '08:00', close: '18:45' },
      sunday: { open: '08:00', close: '18:45' }
    },
    entry_fee: 0,
    city: 'Paris',
    country: 'France',
    tags: ['gothic', 'architecture', 'history', 'religious'],
    description: 'Medieval Catholic cathedral and architectural masterpiece',
    last_updated: new Date()
  },

  // London, UK
  {
    place_id: 'london_big_ben',
    name: 'Big Ben',
    category: ['tourist_attraction', 'monument'],
    location: { lat: 51.4994, lng: -0.1245 },
    rating: 4.5,
    opening_hours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '09:00', close: '17:00' },
      sunday: { open: '09:00', close: '17:00' }
    },
    entry_fee: 0,
    city: 'London',
    country: 'United Kingdom',
    tags: ['iconic', 'clock_tower', 'parliament', 'history'],
    description: 'Famous clock tower and symbol of London',
    last_updated: new Date()
  },
  {
    place_id: 'london_british_museum',
    name: 'British Museum',
    category: ['museum', 'cultural_center'],
    location: { lat: 51.5194, lng: -0.1270 },
    rating: 4.7,
    opening_hours: {
      monday: { open: '10:00', close: '17:00' },
      tuesday: { open: '10:00', close: '17:00' },
      wednesday: { open: '10:00', close: '17:00' },
      thursday: { open: '10:00', close: '20:30' },
      friday: { open: '10:00', close: '20:30' },
      saturday: { open: '10:00', close: '17:00' },
      sunday: { open: '10:00', close: '17:00' }
    },
    entry_fee: 0,
    city: 'London',
    country: 'United Kingdom',
    tags: ['history', 'culture', 'artifacts', 'free'],
    description: 'World-famous museum of human history and culture',
    last_updated: new Date()
  },

  // New York, USA
  {
    place_id: 'nyc_statue_liberty',
    name: 'Statue of Liberty',
    category: ['tourist_attraction', 'monument'],
    location: { lat: 40.6892, lng: -74.0445 },
    rating: 4.6,
    opening_hours: {
      monday: { open: '08:30', close: '18:00' },
      tuesday: { open: '08:30', close: '18:00' },
      wednesday: { open: '08:30', close: '18:00' },
      thursday: { open: '08:30', close: '18:00' },
      friday: { open: '08:30', close: '18:00' },
      saturday: { open: '08:30', close: '18:00' },
      sunday: { open: '08:30', close: '18:00' }
    },
    entry_fee: 24,
    city: 'New York',
    country: 'United States',
    tags: ['iconic', 'freedom', 'ferry', 'views'],
    description: 'Symbol of freedom and democracy',
    last_updated: new Date()
  },
  {
    place_id: 'nyc_central_park',
    name: 'Central Park',
    category: ['park', 'outdoor'],
    location: { lat: 40.7829, lng: -73.9654 },
    rating: 4.7,
    opening_hours: {
      monday: { open: '06:00', close: '01:00' },
      tuesday: { open: '06:00', close: '01:00' },
      wednesday: { open: '06:00', close: '01:00' },
      thursday: { open: '06:00', close: '01:00' },
      friday: { open: '06:00', close: '01:00' },
      saturday: { open: '06:00', close: '01:00' },
      sunday: { open: '06:00', close: '01:00' }
    },
    entry_fee: 0,
    city: 'New York',
    country: 'United States',
    tags: ['nature', 'walking', 'free', 'relaxation'],
    description: 'Large public park in Manhattan',
    last_updated: new Date()
  },

  // Tokyo, Japan
  {
    place_id: 'tokyo_senso_ji',
    name: 'Senso-ji Temple',
    category: ['temple', 'religious_site'],
    location: { lat: 35.7148, lng: 139.7967 },
    rating: 4.3,
    opening_hours: {
      monday: { open: '06:00', close: '17:00' },
      tuesday: { open: '06:00', close: '17:00' },
      wednesday: { open: '06:00', close: '17:00' },
      thursday: { open: '06:00', close: '17:00' },
      friday: { open: '06:00', close: '17:00' },
      saturday: { open: '06:00', close: '17:00' },
      sunday: { open: '06:00', close: '17:00' }
    },
    entry_fee: 0,
    city: 'Tokyo',
    country: 'Japan',
    tags: ['traditional', 'buddhist', 'culture', 'asakusa'],
    description: 'Ancient Buddhist temple in Asakusa',
    last_updated: new Date()
  },
  {
    place_id: 'tokyo_shibuya_crossing',
    name: 'Shibuya Crossing',
    category: ['tourist_attraction', 'street'],
    location: { lat: 35.6598, lng: 139.7006 },
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
    city: 'Tokyo',
    country: 'Japan',
    tags: ['busy', 'iconic', 'urban', 'free'],
    description: 'Famous scramble crossing and symbol of Tokyo',
    last_updated: new Date()
  },

  // Rome, Italy
  {
    place_id: 'rome_colosseum',
    name: 'Colosseum',
    category: ['historical_site', 'monument'],
    location: { lat: 41.8902, lng: 12.4922 },
    rating: 4.6,
    opening_hours: {
      monday: { open: '08:30', close: '19:15' },
      tuesday: { open: '08:30', close: '19:15' },
      wednesday: { open: '08:30', close: '19:15' },
      thursday: { open: '08:30', close: '19:15' },
      friday: { open: '08:30', close: '19:15' },
      saturday: { open: '08:30', close: '19:15' },
      sunday: { open: '08:30', close: '19:15' }
    },
    entry_fee: 16,
    city: 'Rome',
    country: 'Italy',
    tags: ['ancient', 'gladiators', 'history', 'iconic'],
    description: 'Ancient Roman amphitheater and architectural marvel',
    last_updated: new Date()
  },
  {
    place_id: 'rome_vatican_museums',
    name: 'Vatican Museums',
    category: ['museum', 'religious_site'],
    location: { lat: 41.9065, lng: 12.4536 },
    rating: 4.5,
    opening_hours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '08:00', close: '18:00' }
    },
    entry_fee: 20,
    city: 'Rome',
    country: 'Italy',
    tags: ['art', 'sistine_chapel', 'michelangelo', 'religious'],
    description: 'World-renowned art collection and Sistine Chapel',
    last_updated: new Date()
  }
];

async function seedPlaces() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing places
    await Place.deleteMany({});
    console.log('Cleared existing places');

    // Insert sample places
    await Place.insertMany(samplePlaces);
    console.log(`Inserted ${samplePlaces.length} sample places`);

    // Create indexes
    await Place.createIndexes();
    console.log('Created database indexes');

    console.log('Seeding completed successfully!');
    
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedPlaces();