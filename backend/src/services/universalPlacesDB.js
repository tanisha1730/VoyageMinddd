const logger = require('../utils/logger');

class UniversalPlacesDB {
  constructor() {
    this.realPlacesDB = this.initializeUniversalPlaces();
  }

  initializeUniversalPlaces() {
    return {
      // Indian States and Cities
      'gujarat': [
        {
          place_id: 'gujarat_statue_of_unity',
          name: 'Statue of Unity',
          category: ['monument', 'tourist_attraction'],
          location: { lat: 21.8380, lng: 73.7191 },
          rating: 4.6,
          entry_fee: 150,
          tags: ['famous', 'monument', 'sardar_patel', 'kevadia'],
          description: 'World\'s tallest statue dedicated to Sardar Vallabhbhai Patel.',
          enhanced_description: 'The Statue of Unity stands 182 meters tall and is a tribute to India\'s Iron Man.'
        },
        {
          place_id: 'gujarat_rann_of_kutch',
          name: 'Rann of Kutch',
          category: ['nature', 'desert', 'festival'],
          location: { lat: 23.7337, lng: 69.8597 },
          rating: 4.7,
          entry_fee: 0,
          tags: ['white_desert', 'festival', 'nature', 'unique'],
          description: 'Spectacular white salt desert, especially beautiful during Rann Utsav.',
          enhanced_description: 'The Great Rann of Kutch transforms into a white wonderland during winter months.'
        },
        {
          place_id: 'gujarat_somnath_temple',
          name: 'Somnath Temple',
          category: ['temple', 'religious', 'historic'],
          location: { lat: 20.8880, lng: 70.4017 },
          rating: 4.5,
          entry_fee: 0,
          tags: ['jyotirlinga', 'temple', 'religious', 'historic'],
          description: 'One of the 12 Jyotirlinga temples dedicated to Lord Shiva.',
          enhanced_description: 'Ancient temple with rich history, rebuilt multiple times, located by the Arabian Sea.'
        },
        {
          place_id: 'gujarat_gir_national_park',
          name: 'Gir National Park',
          category: ['wildlife', 'nature', 'safari'],
          location: { lat: 21.1249, lng: 70.7947 },
          rating: 4.4,
          entry_fee: 500,
          tags: ['lions', 'wildlife', 'safari', 'nature'],
          description: 'Home to the Asiatic lions and diverse wildlife.',
          enhanced_description: 'The only place in the world where you can see Asiatic lions in their natural habitat.'
        },
        {
          place_id: 'gujarat_dwarka',
          name: 'Dwarka',
          category: ['religious', 'historic', 'pilgrimage'],
          location: { lat: 22.2394, lng: 68.9678 },
          rating: 4.3,
          entry_fee: 0,
          tags: ['krishna', 'temple', 'pilgrimage', 'historic'],
          description: 'Sacred city associated with Lord Krishna, one of the Char Dham.',
          enhanced_description: 'Ancient city believed to be Krishna\'s kingdom, important pilgrimage site.'
        },
        {
          place_id: 'gujarat_ahmedabad_old_city',
          name: 'Ahmedabad Old City',
          category: ['historic', 'culture', 'heritage'],
          location: { lat: 23.0225, lng: 72.5714 },
          rating: 4.2,
          entry_fee: 0,
          tags: ['unesco', 'heritage', 'culture', 'historic'],
          description: 'UNESCO World Heritage Site with rich architectural heritage.',
          enhanced_description: 'First UNESCO World Heritage City in India with stunning Indo-Islamic architecture.'
        },
        {
          place_id: 'gujarat_sabarmati_ashram',
          name: 'Sabarmati Ashram',
          category: ['historic', 'museum', 'gandhi'],
          location: { lat: 23.0607, lng: 72.5800 },
          rating: 4.4,
          entry_fee: 0,
          tags: ['gandhi', 'freedom_struggle', 'historic', 'museum'],
          description: 'Mahatma Gandhi\'s residence and center of Indian freedom struggle.',
          enhanced_description: 'Historic ashram where Gandhi lived and launched the Salt March.'
        },
        {
          place_id: 'gujarat_champaner_pavagadh',
          name: 'Champaner-Pavagadh',
          category: ['historic', 'archaeological', 'temple'],
          location: { lat: 22.4823, lng: 73.5347 },
          rating: 4.1,
          entry_fee: 25,
          tags: ['unesco', 'archaeological', 'historic', 'temple'],
          description: 'UNESCO World Heritage Site with medieval Islamic and Hindu architecture.',
          enhanced_description: 'Archaeological park showcasing 8th-14th century Islamic and Hindu monuments.'
        }
      ],

      'rajasthan': [
        {
          place_id: 'rajasthan_jaipur_amber_fort',
          name: 'Amber Fort',
          category: ['fort', 'historic', 'architecture'],
          location: { lat: 26.9855, lng: 75.8513 },
          rating: 4.5,
          entry_fee: 100,
          tags: ['fort', 'rajput', 'architecture', 'historic'],
          description: 'Magnificent fort with stunning Rajput architecture and mirror work.',
          enhanced_description: 'Spectacular hilltop fort known for its artistic Hindu style elements.'
        },
        {
          place_id: 'rajasthan_udaipur_city_palace',
          name: 'City Palace Udaipur',
          category: ['palace', 'museum', 'architecture'],
          location: { lat: 24.5760, lng: 73.6831 },
          rating: 4.6,
          entry_fee: 300,
          tags: ['palace', 'museum', 'lake', 'architecture'],
          description: 'Magnificent palace complex overlooking Lake Pichola.',
          enhanced_description: 'Stunning palace complex with courtyards, pavilions, terraces, corridors and gardens.'
        }
      ],

      'kerala': [
        {
          place_id: 'kerala_backwaters_alleppey',
          name: 'Alleppey Backwaters',
          category: ['nature', 'boat', 'scenic'],
          location: { lat: 9.4981, lng: 76.3388 },
          rating: 4.7,
          entry_fee: 0,
          tags: ['backwaters', 'houseboat', 'nature', 'scenic'],
          description: 'Serene network of canals, rivers, and lakes with houseboat cruises.',
          enhanced_description: 'Venice of the East with tranquil backwaters and traditional houseboats.'
        }
      ],

      'goa': [
        {
          place_id: 'goa_baga_beach',
          name: 'Baga Beach',
          category: ['beach', 'water_sports', 'nightlife'],
          location: { lat: 15.5557, lng: 73.7516 },
          rating: 4.2,
          entry_fee: 0,
          tags: ['beach', 'water_sports', 'nightlife', 'popular'],
          description: 'Popular beach known for water sports and vibrant nightlife.',
          enhanced_description: 'Lively beach with shacks, water sports, and famous Saturday Night Market nearby.'
        }
      ],

      // International destinations
      'paris': [
        {
          place_id: 'paris_eiffel_tower',
          name: 'Eiffel Tower',
          category: ['monument', 'landmark', 'tourist_attraction'],
          location: { lat: 48.8584, lng: 2.2945 },
          rating: 4.6,
          entry_fee: 25,
          tags: ['iconic', 'monument', 'views', 'famous'],
          description: 'Iconic iron lattice tower and symbol of Paris.',
          enhanced_description: 'The most visited paid monument in the world, offering spectacular city views.'
        },
        {
          place_id: 'paris_louvre_museum',
          name: 'Louvre Museum',
          category: ['museum', 'art', 'culture'],
          location: { lat: 48.8606, lng: 2.3376 },
          rating: 4.7,
          entry_fee: 17,
          tags: ['art', 'museum', 'mona_lisa', 'culture'],
          description: 'World\'s largest art museum housing the Mona Lisa.',
          enhanced_description: 'Former royal palace turned into the world\'s most visited museum.'
        }
      ],

      'london': [
        {
          place_id: 'london_big_ben',
          name: 'Big Ben',
          category: ['landmark', 'historic', 'architecture'],
          location: { lat: 51.4994, lng: -0.1245 },
          rating: 4.5,
          entry_fee: 0,
          tags: ['iconic', 'clock_tower', 'parliament', 'historic'],
          description: 'Iconic clock tower and symbol of London.',
          enhanced_description: 'Famous clock tower at the Palace of Westminster, officially called Elizabeth Tower.'
        }
      ],

      'tokyo': [
        {
          place_id: 'tokyo_senso_ji',
          name: 'Sensō-ji Temple',
          category: ['temple', 'historic', 'culture'],
          location: { lat: 35.7148, lng: 139.7967 },
          rating: 4.3,
          entry_fee: 0,
          tags: ['temple', 'historic', 'asakusa', 'culture'],
          description: 'Tokyo\'s oldest temple with traditional architecture.',
          enhanced_description: 'Ancient Buddhist temple in Asakusa, Tokyo\'s oldest temple founded in 628 AD.'
        }
      ]
    };
  }

  // Get real places for any destination
  getRealPlacesForDestination(destination, interests = [], maxPlaces = 20) {
    const destKey = destination.toLowerCase();
    let places = [];

    // Try exact match first
    if (this.realPlacesDB[destKey]) {
      places = [...this.realPlacesDB[destKey]];
    } else {
      // Try partial matches
      Object.keys(this.realPlacesDB).forEach(key => {
        if (destKey.includes(key) || key.includes(destKey)) {
          places = [...places, ...this.realPlacesDB[key]];
        }
      });
    }

    // If no places found, generate realistic places for the destination
    if (places.length === 0) {
      places = this.generateRealisticPlaces(destination, interests, maxPlaces);
    }

    // Filter by interests if provided
    if (interests.length > 0) {
      const filteredPlaces = places.filter(place => 
        interests.some(interest => 
          place.tags.includes(interest) || 
          place.category.includes(interest) ||
          place.description.toLowerCase().includes(interest.toLowerCase())
        )
      );
      
      if (filteredPlaces.length > 0) {
        places = filteredPlaces;
      }
    }

    // Shuffle and return requested count
    return this.shuffleArray(places).slice(0, maxPlaces);
  }

  // Generate realistic places for any destination
  generateRealisticPlaces(destination, interests = [], count = 20) {
    const placeTypes = [
      {
        name: `${destination} Central Market`,
        category: ['market', 'shopping', 'local'],
        tags: ['local', 'shopping', 'authentic', 'market'],
        description: `Traditional market in the heart of ${destination} with local goods and food.`,
        entry_fee: 0,
        rating: 4.2
      },
      {
        name: `${destination} Heritage Museum`,
        category: ['museum', 'culture', 'historic'],
        tags: ['museum', 'culture', 'historic', 'artifacts'],
        description: `Museum showcasing the rich history and culture of ${destination}.`,
        entry_fee: 50,
        rating: 4.3
      },
      {
        name: `${destination} City Temple`,
        category: ['temple', 'religious', 'architecture'],
        tags: ['temple', 'religious', 'peaceful', 'architecture'],
        description: `Beautiful temple representing the spiritual heritage of ${destination}.`,
        entry_fee: 0,
        rating: 4.4
      },
      {
        name: `${destination} Botanical Garden`,
        category: ['nature', 'garden', 'peaceful'],
        tags: ['nature', 'garden', 'peaceful', 'flora'],
        description: `Serene botanical garden with diverse plant species native to ${destination}.`,
        entry_fee: 20,
        rating: 4.1
      },
      {
        name: `${destination} Art Gallery`,
        category: ['art', 'gallery', 'culture'],
        tags: ['art', 'gallery', 'culture', 'paintings'],
        description: `Contemporary art gallery featuring works by local and regional artists.`,
        entry_fee: 100,
        rating: 4.0
      },
      {
        name: `${destination} Riverside Park`,
        category: ['park', 'nature', 'recreation'],
        tags: ['park', 'nature', 'recreation', 'family'],
        description: `Beautiful park along the river, perfect for walks and family time.`,
        entry_fee: 0,
        rating: 4.2
      },
      {
        name: `${destination} Food Street`,
        category: ['food', 'street_food', 'local'],
        tags: ['food', 'street_food', 'local', 'authentic'],
        description: `Famous food street offering authentic local cuisine and delicacies.`,
        entry_fee: 0,
        rating: 4.5
      },
      {
        name: `${destination} Handicraft Center`,
        category: ['shopping', 'handicraft', 'local'],
        tags: ['handicraft', 'shopping', 'local', 'souvenirs'],
        description: `Center showcasing traditional handicrafts and local artisan work.`,
        entry_fee: 0,
        rating: 4.1
      },
      {
        name: `${destination} Viewpoint`,
        category: ['viewpoint', 'scenic', 'photography'],
        tags: ['viewpoint', 'scenic', 'photography', 'panoramic'],
        description: `Scenic viewpoint offering panoramic views of ${destination} and surroundings.`,
        entry_fee: 10,
        rating: 4.6
      },
      {
        name: `${destination} Cultural Center`,
        category: ['culture', 'performance', 'arts'],
        tags: ['culture', 'performance', 'arts', 'traditional'],
        description: `Cultural center hosting traditional performances and cultural events.`,
        entry_fee: 150,
        rating: 4.3
      }
    ];

    return placeTypes.slice(0, count).map((place, index) => ({
      place_id: `${destination.toLowerCase().replace(/\s+/g, '_')}_generated_${index}`,
      name: place.name,
      category: place.category,
      location: { lat: 0, lng: 0 }, // Would need geocoding for real coordinates
      rating: place.rating + (Math.random() * 0.4 - 0.2), // Add some variation
      entry_fee: place.entry_fee,
      tags: place.tags,
      description: place.description,
      enhanced_description: place.description,
      source: 'generated_realistic'
    }));
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Add more places dynamically
  addPlacesForDestination(destination, places) {
    const destKey = destination.toLowerCase();
    if (!this.realPlacesDB[destKey]) {
      this.realPlacesDB[destKey] = [];
    }
    this.realPlacesDB[destKey] = [...this.realPlacesDB[destKey], ...places];
  }
}

module.exports = new UniversalPlacesDB();