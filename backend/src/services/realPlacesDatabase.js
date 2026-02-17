// Real places database with actual attractions from around the world
const realWorldPlaces = {
  // Paris, France
  'paris': [
    { name: 'Eiffel Tower', category: ['monument'], rating: 4.6, entry_fee: 29, tags: ['iconic', 'views', 'famous'], description: 'Iron lattice tower, symbol of Paris' },
    { name: 'Louvre Museum', category: ['museum'], rating: 4.7, entry_fee: 17, tags: ['art', 'mona_lisa', 'famous'], description: 'World\'s largest art museum' },
    { name: 'Notre-Dame Cathedral', category: ['church'], rating: 4.5, entry_fee: 0, tags: ['gothic', 'history', 'famous'], description: 'Medieval Catholic cathedral' },
    { name: 'Arc de Triomphe', category: ['monument'], rating: 4.5, entry_fee: 13, tags: ['history', 'views', 'famous'], description: 'Triumphal arch on Champs-Élysées' },
    { name: 'Sacré-Cœur Basilica', category: ['church'], rating: 4.4, entry_fee: 0, tags: ['religious', 'views', 'montmartre'], description: 'Beautiful basilica in Montmartre' },
    { name: 'Musée d\'Orsay', category: ['museum'], rating: 4.6, entry_fee: 16, tags: ['art', 'impressionist', 'culture'], description: 'Impressionist art museum' },
    { name: 'Seine River Cruise', category: ['tour'], rating: 4.3, entry_fee: 15, tags: ['romantic', 'sightseeing', 'river'], description: 'Scenic boat tour along the Seine' },
    { name: 'Latin Quarter', category: ['neighborhood'], rating: 4.4, entry_fee: 0, tags: ['historic', 'walking', 'culture'], description: 'Historic student quarter with narrow streets' }
  ],

  // London, UK
  'london': [
    { name: 'Tower of London', category: ['castle'], rating: 4.5, entry_fee: 30, tags: ['history', 'crown_jewels', 'famous'], description: 'Historic castle with Crown Jewels' },
    { name: 'British Museum', category: ['museum'], rating: 4.7, entry_fee: 0, tags: ['history', 'artifacts', 'free'], description: 'World history and culture museum' },
    { name: 'Westminster Abbey', category: ['church'], rating: 4.5, entry_fee: 25, tags: ['royal', 'history', 'famous'], description: 'Royal church with 1000 years of history' },
    { name: 'London Eye', category: ['attraction'], rating: 4.2, entry_fee: 32, tags: ['views', 'modern', 'famous'], description: 'Giant observation wheel on Thames' },
    { name: 'Tate Modern', category: ['museum'], rating: 4.4, entry_fee: 0, tags: ['art', 'modern', 'free'], description: 'Modern and contemporary art museum' },
    { name: 'Covent Garden', category: ['market'], rating: 4.3, entry_fee: 0, tags: ['shopping', 'entertainment', 'street_performers'], description: 'Historic market with shops and street performers' },
    { name: 'Hyde Park', category: ['park'], rating: 4.5, entry_fee: 0, tags: ['nature', 'walking', 'free'], description: 'Large royal park in central London' },
    { name: 'Camden Market', category: ['market'], rating: 4.2, entry_fee: 0, tags: ['alternative', 'food', 'shopping'], description: 'Alternative market with food and crafts' }
  ],

  // Tokyo, Japan
  'tokyo': [
    { name: 'Senso-ji Temple', category: ['temple'], rating: 4.3, entry_fee: 0, tags: ['traditional', 'buddhist', 'asakusa'], description: 'Ancient Buddhist temple in Asakusa' },
    { name: 'Shibuya Crossing', category: ['attraction'], rating: 4.2, entry_fee: 0, tags: ['modern', 'busy', 'iconic'], description: 'World\'s busiest pedestrian crossing' },
    { name: 'Meiji Shrine', category: ['shrine'], rating: 4.4, entry_fee: 0, tags: ['peaceful', 'nature', 'shinto'], description: 'Shinto shrine in forested area' },
    { name: 'Tokyo Skytree', category: ['tower'], rating: 4.1, entry_fee: 25, tags: ['modern', 'views', 'tall'], description: 'Tallest structure in Japan with city views' },
    { name: 'Tsukiji Outer Market', category: ['market'], rating: 4.4, entry_fee: 0, tags: ['food', 'sushi', 'authentic'], description: 'Famous fish market with fresh sushi' },
    { name: 'Imperial Palace Gardens', category: ['garden'], rating: 4.2, entry_fee: 0, tags: ['peaceful', 'nature', 'royal'], description: 'Beautiful gardens around Imperial Palace' },
    { name: 'Harajuku District', category: ['neighborhood'], rating: 4.0, entry_fee: 0, tags: ['fashion', 'youth', 'colorful'], description: 'Trendy district known for fashion and pop culture' },
    { name: 'Tokyo National Museum', category: ['museum'], rating: 4.3, entry_fee: 12, tags: ['culture', 'art', 'history'], description: 'Japan\'s oldest and largest museum' }
  ],

  // New York, USA
  'new york': [
    { name: 'Statue of Liberty', category: ['monument'], rating: 4.6, entry_fee: 24, tags: ['iconic', 'freedom', 'ferry'], description: 'Symbol of freedom and democracy' },
    { name: 'Central Park', category: ['park'], rating: 4.7, entry_fee: 0, tags: ['nature', 'walking', 'free'], description: 'Large public park in Manhattan' },
    { name: 'Empire State Building', category: ['building'], rating: 4.4, entry_fee: 37, tags: ['iconic', 'views', 'art_deco'], description: 'Art Deco skyscraper with observation decks' },
    { name: 'Metropolitan Museum', category: ['museum'], rating: 4.6, entry_fee: 25, tags: ['art', 'culture', 'world_class'], description: 'One of world\'s largest art museums' },
    { name: 'Brooklyn Bridge', category: ['bridge'], rating: 4.5, entry_fee: 0, tags: ['historic', 'walking', 'views'], description: 'Historic suspension bridge with walkway' },
    { name: 'High Line', category: ['park'], rating: 4.4, entry_fee: 0, tags: ['unique', 'walking', 'art'], description: 'Elevated park built on former railway' },
    { name: '9/11 Memorial', category: ['memorial'], rating: 4.7, entry_fee: 0, tags: ['memorial', 'moving', 'history'], description: 'Memorial to September 11 attacks' },
    { name: 'Times Square', category: ['square'], rating: 4.0, entry_fee: 0, tags: ['bright', 'entertainment', 'busy'], description: 'Bright lights and Broadway theaters' }
  ],

  // Rome, Italy
  'rome': [
    { name: 'Colosseum', category: ['monument'], rating: 4.6, entry_fee: 16, tags: ['ancient', 'gladiators', 'iconic'], description: 'Ancient Roman amphitheater' },
    { name: 'Vatican Museums', category: ['museum'], rating: 4.5, entry_fee: 20, tags: ['art', 'sistine_chapel', 'religious'], description: 'Papal art collection and Sistine Chapel' },
    { name: 'Trevi Fountain', category: ['fountain'], rating: 4.5, entry_fee: 0, tags: ['baroque', 'wishes', 'romantic'], description: 'Baroque fountain for making wishes' },
    { name: 'Roman Forum', category: ['ruins'], rating: 4.4, entry_fee: 16, tags: ['ancient', 'history', 'ruins'], description: 'Ancient Roman public square ruins' },
    { name: 'Pantheon', category: ['monument'], rating: 4.6, entry_fee: 0, tags: ['ancient', 'architecture', 'dome'], description: 'Best-preserved Roman building' },
    { name: 'Spanish Steps', category: ['stairs'], rating: 4.2, entry_fee: 0, tags: ['baroque', 'shopping', 'gathering'], description: 'Famous baroque stairway' },
    { name: 'Castel Sant\'Angelo', category: ['castle'], rating: 4.3, entry_fee: 15, tags: ['history', 'views', 'papal'], description: 'Cylindrical building with papal history' },
    { name: 'Trastevere', category: ['neighborhood'], rating: 4.4, entry_fee: 0, tags: ['authentic', 'food', 'nightlife'], description: 'Charming neighborhood with authentic restaurants' }
  ],

  // Barcelona, Spain
  'barcelona': [
    { name: 'Sagrada Família', category: ['church'], rating: 4.7, entry_fee: 26, tags: ['gaudi', 'unique', 'famous'], description: 'Gaudí\'s unfinished masterpiece' },
    { name: 'Park Güell', category: ['park'], rating: 4.4, entry_fee: 10, tags: ['gaudi', 'colorful', 'views'], description: 'Whimsical park with colorful mosaics' },
    { name: 'Casa Batlló', category: ['building'], rating: 4.5, entry_fee: 35, tags: ['gaudi', 'architecture', 'unique'], description: 'Modernist building with organic design' },
    { name: 'La Rambla', category: ['street'], rating: 4.0, entry_fee: 0, tags: ['walking', 'street_performers', 'shopping'], description: 'Famous pedestrian street' },
    { name: 'Gothic Quarter', category: ['neighborhood'], rating: 4.4, entry_fee: 0, tags: ['medieval', 'walking', 'history'], description: 'Medieval neighborhood with narrow streets' },
    { name: 'Picasso Museum', category: ['museum'], rating: 4.3, entry_fee: 14, tags: ['art', 'picasso', 'culture'], description: 'Extensive collection of Picasso\'s works' },
    { name: 'Barceloneta Beach', category: ['beach'], rating: 4.1, entry_fee: 0, tags: ['beach', 'swimming', 'relaxing'], description: 'Popular city beach with restaurants' },
    { name: 'Casa Milà', category: ['building'], rating: 4.4, entry_fee: 25, tags: ['gaudi', 'architecture', 'rooftop'], description: 'Modernist building with unique rooftop' }
  ],

  // Amsterdam, Netherlands
  'amsterdam': [
    { name: 'Anne Frank House', category: ['museum'], rating: 4.4, entry_fee: 14, tags: ['history', 'wwii', 'moving'], description: 'Historic house and museum' },
    { name: 'Van Gogh Museum', category: ['museum'], rating: 4.6, entry_fee: 20, tags: ['art', 'van_gogh', 'paintings'], description: 'World\'s largest Van Gogh collection' },
    { name: 'Rijksmuseum', category: ['museum'], rating: 4.6, entry_fee: 20, tags: ['art', 'dutch', 'history'], description: 'Dutch national museum' },
    { name: 'Jordaan District', category: ['neighborhood'], rating: 4.5, entry_fee: 0, tags: ['charming', 'canals', 'local'], description: 'Picturesque neighborhood with canals' },
    { name: 'Vondelpark', category: ['park'], rating: 4.4, entry_fee: 0, tags: ['nature', 'relaxing', 'free'], description: 'Large urban park perfect for strolling' },
    { name: 'Red Light District', category: ['neighborhood'], rating: 3.8, entry_fee: 0, tags: ['nightlife', 'historic', 'unique'], description: 'Historic area with unique nightlife' },
    { name: 'Canal Cruise', category: ['tour'], rating: 4.3, entry_fee: 18, tags: ['sightseeing', 'canals', 'relaxing'], description: 'Scenic boat tour through historic canals' },
    { name: 'Bloemenmarkt', category: ['market'], rating: 4.1, entry_fee: 0, tags: ['flowers', 'unique', 'shopping'], description: 'Famous floating flower market' }
  ],

  // Mumbai, India
  'mumbai': [
    { name: 'Gateway of India', category: ['monument'], rating: 4.2, entry_fee: 0, tags: ['iconic', 'colonial', 'waterfront'], description: 'Iconic arch monument overlooking Arabian Sea' },
    { name: 'Chhatrapati Shivaji Terminus', category: ['railway_station'], rating: 4.4, entry_fee: 0, tags: ['architecture', 'unesco', 'historic'], description: 'UNESCO World Heritage railway station' },
    { name: 'Marine Drive', category: ['promenade'], rating: 4.3, entry_fee: 0, tags: ['waterfront', 'sunset', 'walking'], description: 'Scenic waterfront promenade' },
    { name: 'Elephanta Caves', category: ['caves'], rating: 4.1, entry_fee: 40, tags: ['ancient', 'sculptures', 'ferry'], description: 'Ancient rock-cut caves with sculptures' },
    { name: 'Crawford Market', category: ['market'], rating: 4.0, entry_fee: 0, tags: ['shopping', 'local', 'food'], description: 'Historic market with local goods' },
    { name: 'Hanging Gardens', category: ['garden'], rating: 3.9, entry_fee: 0, tags: ['nature', 'views', 'peaceful'], description: 'Terraced gardens with city views' },
    { name: 'Juhu Beach', category: ['beach'], rating: 3.8, entry_fee: 0, tags: ['beach', 'street_food', 'sunset'], description: 'Popular beach with street food stalls' },
    { name: 'Dharavi Slum Tour', category: ['tour'], rating: 4.2, entry_fee: 25, tags: ['cultural', 'educational', 'authentic'], description: 'Educational tour of Asia\'s largest slum' }
  ],

  // Delhi, India
  'delhi': [
    { name: 'Red Fort', category: ['fort'], rating: 4.3, entry_fee: 35, tags: ['mughal', 'unesco', 'history'], description: 'Mughal fort and UNESCO World Heritage site' },
    { name: 'India Gate', category: ['monument'], rating: 4.4, entry_fee: 0, tags: ['memorial', 'iconic', 'free'], description: 'War memorial arch' },
    { name: 'Qutub Minar', category: ['monument'], rating: 4.2, entry_fee: 35, tags: ['unesco', 'tower', 'history'], description: 'Tallest brick minaret in the world' },
    { name: 'Lotus Temple', category: ['temple'], rating: 4.4, entry_fee: 0, tags: ['modern', 'architecture', 'peaceful'], description: 'Lotus-shaped Bahá\'í House of Worship' },
    { name: 'Humayun\'s Tomb', category: ['tomb'], rating: 4.3, entry_fee: 35, tags: ['mughal', 'unesco', 'architecture'], description: 'Mughal emperor\'s tomb, precursor to Taj Mahal' },
    { name: 'Chandni Chowk', category: ['market'], rating: 4.1, entry_fee: 0, tags: ['shopping', 'food', 'chaotic'], description: 'Bustling old market with street food' },
    { name: 'Akshardham Temple', category: ['temple'], rating: 4.5, entry_fee: 0, tags: ['modern', 'spiritual', 'architecture'], description: 'Modern Hindu temple complex' },
    { name: 'Raj Ghat', category: ['memorial'], rating: 4.2, entry_fee: 0, tags: ['gandhi', 'peaceful', 'memorial'], description: 'Memorial to Mahatma Gandhi' }
  ],

  // Bangkok, Thailand
  'bangkok': [
    { name: 'Grand Palace', category: ['palace'], rating: 4.4, entry_fee: 15, tags: ['royal', 'thai', 'ornate'], description: 'Ornate royal palace complex' },
    { name: 'Wat Pho Temple', category: ['temple'], rating: 4.5, entry_fee: 3, tags: ['buddhist', 'reclining_buddha', 'massage'], description: 'Temple with giant reclining Buddha' },
    { name: 'Wat Arun', category: ['temple'], rating: 4.3, entry_fee: 1.5, tags: ['riverside', 'dawn_temple', 'climbing'], description: 'Temple of Dawn by the river' },
    { name: 'Chatuchak Market', category: ['market'], rating: 4.2, entry_fee: 0, tags: ['shopping', 'weekend', 'huge'], description: 'Massive weekend market' },
    { name: 'Floating Market', category: ['market'], rating: 4.0, entry_fee: 10, tags: ['traditional', 'boat', 'food'], description: 'Traditional floating market tour' },
    { name: 'Khao San Road', category: ['street'], rating: 3.9, entry_fee: 0, tags: ['backpacker', 'nightlife', 'food'], description: 'Famous backpacker street' },
    { name: 'Jim Thompson House', category: ['museum'], rating: 4.4, entry_fee: 6, tags: ['silk', 'traditional', 'house'], description: 'Traditional Thai house museum' },
    { name: 'Lumpini Park', category: ['park'], rating: 4.2, entry_fee: 0, tags: ['nature', 'jogging', 'peaceful'], description: 'Large park in city center' }
  ],

  // Dubai, UAE
  'dubai': [
    { name: 'Burj Khalifa', category: ['building'], rating: 4.6, entry_fee: 40, tags: ['tallest', 'views', 'modern'], description: 'World\'s tallest building' },
    { name: 'Dubai Mall', category: ['shopping'], rating: 4.4, entry_fee: 0, tags: ['shopping', 'huge', 'entertainment'], description: 'One of world\'s largest shopping malls' },
    { name: 'Palm Jumeirah', category: ['island'], rating: 4.3, entry_fee: 0, tags: ['artificial', 'luxury', 'beach'], description: 'Artificial palm-shaped island' },
    { name: 'Dubai Marina', category: ['marina'], rating: 4.4, entry_fee: 0, tags: ['modern', 'waterfront', 'dining'], description: 'Modern marina with restaurants and walks' },
    { name: 'Gold Souk', category: ['market'], rating: 4.1, entry_fee: 0, tags: ['gold', 'traditional', 'shopping'], description: 'Traditional gold jewelry market' },
    { name: 'Dubai Fountain', category: ['fountain'], rating: 4.5, entry_fee: 0, tags: ['show', 'music', 'free'], description: 'Choreographed fountain show' },
    { name: 'Jumeirah Beach', category: ['beach'], rating: 4.2, entry_fee: 0, tags: ['beach', 'swimming', 'luxury'], description: 'Beautiful white sand beach' },
    { name: 'Dubai Creek', category: ['waterway'], rating: 4.2, entry_fee: 5, tags: ['traditional', 'boat', 'historic'], description: 'Historic waterway with traditional boats' }
  ]
};

class RealPlacesDatabase {
  constructor() {
    this.places = realWorldPlaces;
  }

  getPlacesForDestination(destination, interests = [], days = 3) {
    const destinationKey = this.findDestinationKey(destination);
    let places = [];

    if (destinationKey && this.places[destinationKey]) {
      places = [...this.places[destinationKey]];
    }

    // Filter and score places based on interests
    if (interests.length > 0) {
      places = places.map(place => ({
        ...place,
        relevance_score: this.calculateRelevanceScore(place, interests)
      })).sort((a, b) => b.relevance_score - a.relevance_score);
    }

    // Ensure we have enough places for all days
    const minPlaces = days * 3;
    while (places.length < minPlaces && destinationKey) {
      // Add more generic places
      places.push(...this.generateAdditionalPlaces(destination, interests, places.length));
    }

    return places.slice(0, minPlaces).map((place, index) => ({
      place_id: `${destinationKey}_${index}`,
      name: place.name,
      category: place.category,
      location: { lat: 0, lng: 0 }, // Would be geocoded with real API
      rating: place.rating,
      entry_fee: place.entry_fee,
      city: this.capitalizeWords(destination),
      country: this.getCountryForDestination(destinationKey),
      tags: place.tags,
      description: place.description,
      relevance_score: place.relevance_score || 0.8
    }));
  }

  findDestinationKey(destination) {
    const destLower = destination.toLowerCase();
    
    // Direct match
    if (this.places[destLower]) {
      return destLower;
    }

    // Partial match
    const keys = Object.keys(this.places);
    return keys.find(key => 
      destLower.includes(key) || key.includes(destLower)
    );
  }

  calculateRelevanceScore(place, interests) {
    let score = 0.5; // Base score

    interests.forEach(interest => {
      const interestLower = interest.toLowerCase();
      
      // Check tags
      if (place.tags.some(tag => tag.includes(interestLower))) {
        score += 0.3;
      }
      
      // Check category
      if (place.category.some(cat => cat.includes(interestLower))) {
        score += 0.2;
      }
      
      // Specific interest matching
      if (interestLower === 'art' && (place.tags.includes('art') || place.category.includes('museum'))) {
        score += 0.4;
      }
      if (interestLower === 'food' && (place.tags.includes('food') || place.category.includes('restaurant'))) {
        score += 0.4;
      }
      if (interestLower === 'history' && (place.tags.includes('history') || place.tags.includes('ancient'))) {
        score += 0.4;
      }
    });

    // Rating boost
    score += (place.rating - 3) / 5; // Boost for high ratings

    return Math.min(score, 1.0);
  }

  generateAdditionalPlaces(destination, interests, currentCount) {
    const additionalPlaces = [
      { name: 'Local Art Gallery', category: ['art_gallery'], rating: 4.1, entry_fee: 12, tags: ['art', 'local', 'culture'] },
      { name: 'City Museum', category: ['museum'], rating: 4.2, entry_fee: 15, tags: ['history', 'culture', 'local'] },
      { name: 'Traditional Restaurant', category: ['restaurant'], rating: 4.3, entry_fee: 30, tags: ['food', 'authentic', 'local'] },
      { name: 'Historic Walking Tour', category: ['tour'], rating: 4.4, entry_fee: 20, tags: ['walking', 'history', 'guided'] },
      { name: 'Local Market', category: ['market'], rating: 4.0, entry_fee: 0, tags: ['shopping', 'local', 'authentic'] },
      { name: 'Scenic Viewpoint', category: ['viewpoint'], rating: 4.2, entry_fee: 0, tags: ['views', 'photos', 'scenic'] }
    ];

    return additionalPlaces.map(place => ({
      ...place,
      name: `${destination} ${place.name}`,
      description: `${place.description || place.name} in ${destination}`
    }));
  }

  capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  getCountryForDestination(destinationKey) {
    const countryMap = {
      'paris': 'France',
      'london': 'United Kingdom',
      'tokyo': 'Japan',
      'new york': 'United States',
      'rome': 'Italy',
      'barcelona': 'Spain',
      'amsterdam': 'Netherlands',
      'mumbai': 'India',
      'delhi': 'India',
      'bangkok': 'Thailand',
      'dubai': 'United Arab Emirates'
    };

    return countryMap[destinationKey] || 'Unknown';
  }

  getAllDestinations() {
    return Object.keys(this.places).map(key => ({
      key,
      name: this.capitalizeWords(key),
      country: this.getCountryForDestination(key),
      place_count: this.places[key].length
    }));
  }
}

module.exports = new RealPlacesDatabase();