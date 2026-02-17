class SmartPlaceGenerator {
  constructor() {
    // Common place types for different destinations
    this.placeTemplates = {
      cultural: [
        { name: 'National Museum', category: ['museum'], tags: ['culture', 'history', 'art'], entry_fee: 15 },
        { name: 'Art Gallery', category: ['art_gallery'], tags: ['art', 'culture', 'paintings'], entry_fee: 12 },
        { name: 'Cultural Center', category: ['cultural_center'], tags: ['culture', 'events', 'local'], entry_fee: 8 },
        { name: 'Historic District', category: ['neighborhood'], tags: ['historic', 'walking', 'architecture'], entry_fee: 0 },
        { name: 'Traditional Market', category: ['market'], tags: ['local', 'shopping', 'food', 'culture'], entry_fee: 0 }
      ],
      famous: [
        { name: 'Main Cathedral', category: ['church'], tags: ['religious', 'architecture', 'famous'], entry_fee: 5 },
        { name: 'City Hall', category: ['government_building'], tags: ['architecture', 'historic', 'famous'], entry_fee: 0 },
        { name: 'Central Square', category: ['square'], tags: ['famous', 'gathering', 'photos'], entry_fee: 0 },
        { name: 'Observation Deck', category: ['viewpoint'], tags: ['views', 'famous', 'photos'], entry_fee: 20 },
        { name: 'Famous Bridge', category: ['bridge'], tags: ['famous', 'architecture', 'photos'], entry_fee: 0 }
      ],
      food: [
        { name: 'Local Restaurant', category: ['restaurant'], tags: ['food', 'local', 'authentic'], entry_fee: 25 },
        { name: 'Street Food Market', category: ['market'], tags: ['food', 'cheap', 'local'], entry_fee: 0 },
        { name: 'Fine Dining Restaurant', category: ['restaurant'], tags: ['food', 'upscale', 'experience'], entry_fee: 60 },
        { name: 'Traditional Cafe', category: ['cafe'], tags: ['coffee', 'local', 'relaxing'], entry_fee: 8 },
        { name: 'Food Hall', category: ['food_court'], tags: ['food', 'variety', 'casual'], entry_fee: 0 }
      ],
      nature: [
        { name: 'City Park', category: ['park'], tags: ['nature', 'walking', 'relaxing'], entry_fee: 0 },
        { name: 'Botanical Garden', category: ['garden'], tags: ['nature', 'plants', 'peaceful'], entry_fee: 10 },
        { name: 'Waterfront', category: ['waterfront'], tags: ['nature', 'views', 'walking'], entry_fee: 0 },
        { name: 'Nature Reserve', category: ['nature_reserve'], tags: ['nature', 'wildlife', 'hiking'], entry_fee: 15 },
        { name: 'Scenic Viewpoint', category: ['viewpoint'], tags: ['nature', 'views', 'photos'], entry_fee: 0 }
      ],
      entertainment: [
        { name: 'Theater District', category: ['theater'], tags: ['entertainment', 'shows', 'culture'], entry_fee: 40 },
        { name: 'Shopping District', category: ['shopping'], tags: ['shopping', 'entertainment', 'modern'], entry_fee: 0 },
        { name: 'Entertainment Complex', category: ['entertainment'], tags: ['fun', 'modern', 'activities'], entry_fee: 25 },
        { name: 'Night Market', category: ['market'], tags: ['nightlife', 'food', 'shopping'], entry_fee: 0 },
        { name: 'Local Pub District', category: ['nightlife'], tags: ['drinks', 'local', 'social'], entry_fee: 0 }
      ]
    };

    // Famous landmarks for specific cities
    this.famousLandmarks = {
      'paris': [
        { name: 'Eiffel Tower', category: ['monument'], tags: ['iconic', 'famous', 'views'], entry_fee: 29 },
        { name: 'Louvre Museum', category: ['museum'], tags: ['art', 'famous', 'mona_lisa'], entry_fee: 17 },
        { name: 'Notre-Dame Cathedral', category: ['church'], tags: ['gothic', 'famous', 'history'], entry_fee: 0 },
        { name: 'Arc de Triomphe', category: ['monument'], tags: ['famous', 'history', 'views'], entry_fee: 13 }
      ],
      'london': [
        { name: 'Big Ben', category: ['monument'], tags: ['iconic', 'famous', 'parliament'], entry_fee: 0 },
        { name: 'British Museum', category: ['museum'], tags: ['history', 'famous', 'free'], entry_fee: 0 },
        { name: 'Tower Bridge', category: ['bridge'], tags: ['famous', 'views', 'iconic'], entry_fee: 11 },
        { name: 'Buckingham Palace', category: ['palace'], tags: ['royal', 'famous', 'ceremony'], entry_fee: 30 }
      ],
      'tokyo': [
        { name: 'Senso-ji Temple', category: ['temple'], tags: ['traditional', 'famous', 'culture'], entry_fee: 0 },
        { name: 'Shibuya Crossing', category: ['street'], tags: ['famous', 'busy', 'modern'], entry_fee: 0 },
        { name: 'Meiji Shrine', category: ['shrine'], tags: ['peaceful', 'famous', 'nature'], entry_fee: 0 },
        { name: 'Tokyo Skytree', category: ['tower'], tags: ['modern', 'views', 'famous'], entry_fee: 25 }
      ],
      'new york': [
        { name: 'Statue of Liberty', category: ['monument'], tags: ['iconic', 'famous', 'freedom'], entry_fee: 24 },
        { name: 'Central Park', category: ['park'], tags: ['nature', 'famous', 'free'], entry_fee: 0 },
        { name: 'Times Square', category: ['square'], tags: ['famous', 'bright', 'entertainment'], entry_fee: 0 },
        { name: 'Empire State Building', category: ['building'], tags: ['famous', 'views', 'iconic'], entry_fee: 37 }
      ],
      'rome': [
        { name: 'Colosseum', category: ['monument'], tags: ['ancient', 'famous', 'gladiators'], entry_fee: 16 },
        { name: 'Vatican Museums', category: ['museum'], tags: ['art', 'famous', 'sistine_chapel'], entry_fee: 20 },
        { name: 'Trevi Fountain', category: ['fountain'], tags: ['famous', 'wishes', 'baroque'], entry_fee: 0 },
        { name: 'Roman Forum', category: ['ruins'], tags: ['ancient', 'history', 'famous'], entry_fee: 16 }
      ]
    };
  }

  generatePlacesForDestination(destination, interests = [], days = 3) {
    const places = [];
    const destinationLower = destination.toLowerCase();
    
    // Add famous landmarks if we have them
    const landmarks = this.famousLandmarks[destinationLower] || [];
    landmarks.forEach((landmark, index) => {
      places.push({
        place_id: `${destinationLower}_landmark_${index}`,
        name: `${landmark.name}`,
        category: landmark.category,
        location: { lat: 0, lng: 0 }, // Would be geocoded in real implementation
        rating: 4.2 + Math.random() * 0.6,
        entry_fee: landmark.entry_fee,
        city: this.capitalizeWords(destination),
        country: this.getCountryForCity(destination),
        tags: landmark.tags,
        description: `Famous ${landmark.category[0]} in ${destination}`
      });
    });

    // Generate places based on interests
    const placesNeeded = Math.max(days * 3, 12); // At least 3 places per day
    const interestCategories = this.mapInterestsToCategories(interests);
    
    interestCategories.forEach(category => {
      const templates = this.placeTemplates[category] || [];
      templates.forEach((template, index) => {
        if (places.length < placesNeeded) {
          places.push({
            place_id: `${destinationLower}_${category}_${index}`,
            name: `${destination} ${template.name}`,
            category: template.category,
            location: { lat: 0, lng: 0 },
            rating: 3.8 + Math.random() * 1.2,
            entry_fee: template.entry_fee,
            city: this.capitalizeWords(destination),
            country: this.getCountryForCity(destination),
            tags: template.tags,
            description: `Popular ${template.category[0]} in ${destination}`
          });
        }
      });
    });

    // Fill remaining slots with general attractions
    while (places.length < placesNeeded) {
      const randomTemplate = this.getRandomTemplate();
      places.push({
        place_id: `${destinationLower}_general_${places.length}`,
        name: `${destination} ${randomTemplate.name}`,
        category: randomTemplate.category,
        location: { lat: 0, lng: 0 },
        rating: 3.5 + Math.random() * 1.5,
        entry_fee: randomTemplate.entry_fee,
        city: this.capitalizeWords(destination),
        country: this.getCountryForCity(destination),
        tags: randomTemplate.tags,
        description: `Recommended ${randomTemplate.category[0]} in ${destination}`
      });
    }

    return places.slice(0, placesNeeded);
  }

  mapInterestsToCategories(interests) {
    const mapping = {
      'art': ['cultural', 'famous'],
      'culture': ['cultural', 'famous'],
      'history': ['cultural', 'famous'],
      'food': ['food'],
      'nature': ['nature'],
      'entertainment': ['entertainment'],
      'nightlife': ['entertainment'],
      'shopping': ['entertainment'],
      'architecture': ['cultural', 'famous'],
      'music': ['entertainment']
    };

    const categories = new Set(['famous']); // Always include famous places
    interests.forEach(interest => {
      const cats = mapping[interest.toLowerCase()] || ['cultural'];
      cats.forEach(cat => categories.add(cat));
    });

    return Array.from(categories);
  }

  getRandomTemplate() {
    const allTemplates = Object.values(this.placeTemplates).flat();
    return allTemplates[Math.floor(Math.random() * allTemplates.length)];
  }

  capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  getCountryForCity(city) {
    const cityCountryMap = {
      'paris': 'France',
      'london': 'United Kingdom',
      'tokyo': 'Japan',
      'new york': 'United States',
      'rome': 'Italy',
      'barcelona': 'Spain',
      'amsterdam': 'Netherlands',
      'berlin': 'Germany',
      'madrid': 'Spain',
      'vienna': 'Austria',
      'prague': 'Czech Republic',
      'budapest': 'Hungary',
      'istanbul': 'Turkey',
      'athens': 'Greece',
      'lisbon': 'Portugal',
      'dublin': 'Ireland',
      'stockholm': 'Sweden',
      'copenhagen': 'Denmark',
      'oslo': 'Norway',
      'helsinki': 'Finland',
      'mumbai': 'India',
      'delhi': 'India',
      'bangalore': 'India',
      'kolkata': 'India',
      'chennai': 'India',
      'hyderabad': 'India',
      'pune': 'India',
      'jaipur': 'India',
      'agra': 'India',
      'goa': 'India'
    };

    return cityCountryMap[city.toLowerCase()] || 'Unknown';
  }
}

module.exports = new SmartPlaceGenerator();