const mongoose = require('mongoose');
require('dotenv').config();

const Place = require('./src/models/Place');

const worldPlaces = [
  // Paris, France
  {
    place_id: 'paris_eiffel_tower',
    name: 'Eiffel Tower',
    category: ['monument', 'tourist_attraction'],
    location: { lat: 48.8584, lng: 2.2945 },
    rating: 4.6,
    entry_fee: 29,
    city: 'Paris',
    country: 'France',
    tags: ['iconic', 'architecture', 'views', 'romantic', 'famous'],
    description: 'Iconic iron lattice tower and symbol of Paris'
  },
  {
    place_id: 'paris_louvre',
    name: 'Louvre Museum',
    category: ['museum', 'art_gallery'],
    location: { lat: 48.8606, lng: 2.3376 },
    rating: 4.7,
    entry_fee: 17,
    city: 'Paris',
    country: 'France',
    tags: ['art', 'culture', 'history', 'mona_lisa', 'famous'],
    description: 'World\'s largest art museum and historic monument'
  },
  {
    place_id: 'paris_notre_dame',
    name: 'Notre-Dame Cathedral',
    category: ['church', 'historical_site'],
    location: { lat: 48.8530, lng: 2.3499 },
    rating: 4.5,
    entry_fee: 0,
    city: 'Paris',
    country: 'France',
    tags: ['gothic', 'architecture', 'history', 'religious', 'famous'],
    description: 'Medieval Catholic cathedral and architectural masterpiece'
  },
  {
    place_id: 'paris_arc_triomphe',
    name: 'Arc de Triomphe',
    category: ['monument', 'historical_site'],
    location: { lat: 48.8738, lng: 2.2950 },
    rating: 4.5,
    entry_fee: 13,
    city: 'Paris',
    country: 'France',
    tags: ['monument', 'history', 'views', 'famous'],
    description: 'Triumphal arch honoring those who fought for France'
  },
  {
    place_id: 'paris_montmartre',
    name: 'Montmartre & Sacré-Cœur',
    category: ['neighborhood', 'church'],
    location: { lat: 48.8867, lng: 2.3431 },
    rating: 4.4,
    entry_fee: 0,
    city: 'Paris',
    country: 'France',
    tags: ['artistic', 'bohemian', 'views', 'culture', 'famous'],
    description: 'Historic artistic district with stunning basilica'
  },

  // London, UK
  {
    place_id: 'london_big_ben',
    name: 'Big Ben & Houses of Parliament',
    category: ['monument', 'government_building'],
    location: { lat: 51.4994, lng: -0.1245 },
    rating: 4.5,
    entry_fee: 0,
    city: 'London',
    country: 'United Kingdom',
    tags: ['iconic', 'clock_tower', 'parliament', 'history', 'famous'],
    description: 'Famous clock tower and seat of British government'
  },
  {
    place_id: 'london_british_museum',
    name: 'British Museum',
    category: ['museum', 'cultural_center'],
    location: { lat: 51.5194, lng: -0.1270 },
    rating: 4.7,
    entry_fee: 0,
    city: 'London',
    country: 'United Kingdom',
    tags: ['history', 'culture', 'artifacts', 'free', 'famous'],
    description: 'World-famous museum of human history and culture'
  },
  {
    place_id: 'london_tower_bridge',
    name: 'Tower Bridge',
    category: ['bridge', 'tourist_attraction'],
    location: { lat: 51.5055, lng: -0.0754 },
    rating: 4.4,
    entry_fee: 11,
    city: 'London',
    country: 'United Kingdom',
    tags: ['iconic', 'bridge', 'views', 'famous'],
    description: 'Iconic Victorian bridge with glass floor walkways'
  },
  {
    place_id: 'london_buckingham_palace',
    name: 'Buckingham Palace',
    category: ['palace', 'tourist_attraction'],
    location: { lat: 51.5014, lng: -0.1419 },
    rating: 4.2,
    entry_fee: 30,
    city: 'London',
    country: 'United Kingdom',
    tags: ['royal', 'palace', 'ceremony', 'famous'],
    description: 'Official residence of the British monarch'
  },

  // Tokyo, Japan
  {
    place_id: 'tokyo_senso_ji',
    name: 'Senso-ji Temple',
    category: ['temple', 'religious_site'],
    location: { lat: 35.7148, lng: 139.7967 },
    rating: 4.3,
    entry_fee: 0,
    city: 'Tokyo',
    country: 'Japan',
    tags: ['traditional', 'buddhist', 'culture', 'asakusa', 'famous'],
    description: 'Ancient Buddhist temple in historic Asakusa district'
  },
  {
    place_id: 'tokyo_shibuya_crossing',
    name: 'Shibuya Crossing',
    category: ['tourist_attraction', 'street'],
    location: { lat: 35.6598, lng: 139.7006 },
    rating: 4.2,
    entry_fee: 0,
    city: 'Tokyo',
    country: 'Japan',
    tags: ['busy', 'iconic', 'urban', 'free', 'famous'],
    description: 'World\'s busiest pedestrian crossing'
  },
  {
    place_id: 'tokyo_meiji_shrine',
    name: 'Meiji Shrine',
    category: ['shrine', 'park'],
    location: { lat: 35.6763, lng: 139.6993 },
    rating: 4.4,
    entry_fee: 0,
    city: 'Tokyo',
    country: 'Japan',
    tags: ['peaceful', 'nature', 'shinto', 'culture', 'famous'],
    description: 'Serene Shinto shrine surrounded by forest'
  },

  // New York, USA
  {
    place_id: 'nyc_statue_liberty',
    name: 'Statue of Liberty',
    category: ['monument', 'tourist_attraction'],
    location: { lat: 40.6892, lng: -74.0445 },
    rating: 4.6,
    entry_fee: 24,
    city: 'New York',
    country: 'United States',
    tags: ['iconic', 'freedom', 'ferry', 'views', 'famous'],
    description: 'Symbol of freedom and democracy'
  },
  {
    place_id: 'nyc_central_park',
    name: 'Central Park',
    category: ['park', 'outdoor'],
    location: { lat: 40.7829, lng: -73.9654 },
    rating: 4.7,
    entry_fee: 0,
    city: 'New York',
    country: 'United States',
    tags: ['nature', 'walking', 'free', 'relaxation', 'famous'],
    description: 'Large public park in Manhattan'
  },
  {
    place_id: 'nyc_times_square',
    name: 'Times Square',
    category: ['tourist_attraction', 'entertainment'],
    location: { lat: 40.7580, lng: -73.9855 },
    rating: 4.0,
    entry_fee: 0,
    city: 'New York',
    country: 'United States',
    tags: ['bright_lights', 'entertainment', 'shopping', 'famous'],
    description: 'Bright lights and Broadway shows in the heart of NYC'
  },

  // Rome, Italy
  {
    place_id: 'rome_colosseum',
    name: 'Colosseum',
    category: ['historical_site', 'monument'],
    location: { lat: 41.8902, lng: 12.4922 },
    rating: 4.6,
    entry_fee: 16,
    city: 'Rome',
    country: 'Italy',
    tags: ['ancient', 'gladiators', 'history', 'iconic', 'famous'],
    description: 'Ancient Roman amphitheater and architectural marvel'
  },
  {
    place_id: 'rome_vatican_museums',
    name: 'Vatican Museums',
    category: ['museum', 'religious_site'],
    location: { lat: 41.9065, lng: 12.4536 },
    rating: 4.5,
    entry_fee: 20,
    city: 'Rome',
    country: 'Italy',
    tags: ['art', 'sistine_chapel', 'michelangelo', 'religious', 'famous'],
    description: 'World-renowned art collection and Sistine Chapel'
  },
  {
    place_id: 'rome_trevi_fountain',
    name: 'Trevi Fountain',
    category: ['fountain', 'tourist_attraction'],
    location: { lat: 41.9009, lng: 12.4833 },
    rating: 4.5,
    entry_fee: 0,
    city: 'Rome',
    country: 'Italy',
    tags: ['baroque', 'fountain', 'wishes', 'romantic', 'famous'],
    description: 'Baroque fountain where wishes come true'
  },

  // Barcelona, Spain
  {
    place_id: 'barcelona_sagrada_familia',
    name: 'Sagrada Família',
    category: ['church', 'architectural_site'],
    location: { lat: 41.4036, lng: 2.1744 },
    rating: 4.7,
    entry_fee: 26,
    city: 'Barcelona',
    country: 'Spain',
    tags: ['gaudi', 'architecture', 'unique', 'religious', 'famous'],
    description: 'Gaudí\'s unfinished architectural masterpiece'
  },
  {
    place_id: 'barcelona_park_guell',
    name: 'Park Güell',
    category: ['park', 'architectural_site'],
    location: { lat: 41.4145, lng: 2.1527 },
    rating: 4.4,
    entry_fee: 10,
    city: 'Barcelona',
    country: 'Spain',
    tags: ['gaudi', 'colorful', 'views', 'art', 'famous'],
    description: 'Whimsical park with colorful mosaics and city views'
  },

  // Amsterdam, Netherlands
  {
    place_id: 'amsterdam_anne_frank_house',
    name: 'Anne Frank House',
    category: ['museum', 'historical_site'],
    location: { lat: 52.3752, lng: 4.8840 },
    rating: 4.4,
    entry_fee: 14,
    city: 'Amsterdam',
    country: 'Netherlands',
    tags: ['history', 'wwii', 'moving', 'educational', 'famous'],
    description: 'Historic house where Anne Frank wrote her diary'
  },
  {
    place_id: 'amsterdam_van_gogh_museum',
    name: 'Van Gogh Museum',
    category: ['museum', 'art_gallery'],
    location: { lat: 52.3584, lng: 4.8811 },
    rating: 4.6,
    entry_fee: 20,
    city: 'Amsterdam',
    country: 'Netherlands',
    tags: ['art', 'van_gogh', 'paintings', 'culture', 'famous'],
    description: 'World\'s largest collection of Van Gogh artworks'
  }
];

async function seedWorldPlaces() {
  try {
    console.log('Connecting to MongoDB...');
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB');
    }

    console.log('Adding world places...');
    
    // Add places one by one to avoid duplicates
    for (const place of worldPlaces) {
      await Place.findOneAndUpdate(
        { place_id: place.place_id },
        place,
        { upsert: true, new: true }
      );
    }
    
    console.log(`✅ Successfully added ${worldPlaces.length} world places!`);
    
    if (process.argv.includes('--standalone')) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
    
  } catch (error) {
    console.error('❌ Failed to seed world places:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  seedWorldPlaces();
}

module.exports = { seedWorldPlaces, worldPlaces };