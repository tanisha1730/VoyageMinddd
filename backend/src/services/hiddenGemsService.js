const logger = require('../utils/logger');

class HiddenGemsService {
  constructor() {
    this.hiddenGems = this.initializeHiddenGems();
  }

  initializeHiddenGems() {
    return {
      // Paris Hidden Gems
      'paris': [
        {
          place_id: 'paris_hidden_1',
          name: 'Promenade Plantée',
          category: ['park', 'local_favorite'],
          location: { lat: 48.8467, lng: 2.3713 },
          rating: 4.6,
          entry_fee: 0,
          tags: ['hidden_gem', 'local', 'peaceful', 'nature', 'unique'],
          description: 'An elevated linear park built on former railway infrastructure, offering a unique perspective of Paris away from crowds.',
          local_tip: 'Best visited early morning for peaceful walks and great photos',
          why_hidden: 'Most tourists stick to ground-level parks like Tuileries'
        },
        {
          place_id: 'paris_hidden_2',
          name: 'Marché des Enfants Rouges',
          category: ['market', 'food', 'local_favorite'],
          location: { lat: 48.8633, lng: 2.3647 },
          rating: 4.5,
          entry_fee: 0,
          tags: ['hidden_gem', 'local', 'food', 'authentic', 'historic'],
          description: 'Paris oldest covered market (1615) with authentic local food stalls and organic produce.',
          local_tip: 'Try the Moroccan tagine at stand #5 - locals queue for it',
          why_hidden: 'Tucked away in Le Marais, overshadowed by touristy food halls'
        },
        {
          place_id: 'paris_hidden_3',
          name: 'Musée de la Chasse et de la Nature',
          category: ['museum', 'art', 'local_favorite'],
          location: { lat: 48.8603, lng: 2.3583 },
          rating: 4.4,
          entry_fee: 8,
          tags: ['hidden_gem', 'quirky', 'art', 'unique', 'small'],
          description: 'Quirky museum blending hunting artifacts with contemporary art in a beautiful mansion.',
          local_tip: 'The taxidermy-art installations are Instagram gold but respectfully done',
          why_hidden: 'Overshadowed by Louvre and Orsay, but locals love its uniqueness'
        },
        {
          place_id: 'paris_hidden_4',
          name: 'Rue Crémieux',
          category: ['street', 'photography', 'local_favorite'],
          location: { lat: 48.8467, lng: 2.3713 },
          rating: 4.3,
          entry_fee: 0,
          tags: ['hidden_gem', 'colorful', 'photography', 'charming', 'residential'],
          description: 'Most colorful cobblestone street in Paris with pastel-painted houses.',
          local_tip: 'Visit during golden hour (7-8 PM in summer) for best photos',
          why_hidden: 'Residential area that most tourists never discover'
        },
        {
          place_id: 'paris_hidden_5',
          name: 'La REcyclerie',
          category: ['cafe', 'local_favorite', 'sustainable'],
          location: { lat: 48.8973, lng: 2.3414 },
          rating: 4.5,
          entry_fee: 0,
          tags: ['hidden_gem', 'local', 'sustainable', 'trendy', 'unique'],
          description: 'Hip eco-cafe in a converted train station with urban farm and vintage decor.',
          local_tip: 'Great for brunch and has a small urban farm you can visit',
          why_hidden: 'Located in 18th arrondissement, away from central tourist areas'
        }
      ],

      // Tokyo Hidden Gems
      'tokyo': [
        {
          place_id: 'tokyo_hidden_1',
          name: 'Todoroki Valley',
          category: ['nature', 'local_favorite'],
          location: { lat: 35.6067, lng: 139.6537 },
          rating: 4.7,
          entry_fee: 0,
          tags: ['hidden_gem', 'nature', 'peaceful', 'gorge', 'temple'],
          description: 'Tokyo only natural gorge with walking trails, temple, and tea house.',
          local_tip: 'Visit the traditional tea house at the end of the trail',
          why_hidden: 'Located in residential Setagaya, unknown to most tourists'
        },
        {
          place_id: 'tokyo_hidden_2',
          name: 'Omoide Yokocho',
          category: ['food', 'nightlife', 'local_favorite'],
          location: { lat: 35.6938, lng: 139.7034 },
          rating: 4.4,
          entry_fee: 0,
          tags: ['hidden_gem', 'authentic', 'yakitori', 'local', 'tiny_bars'],
          description: 'Narrow alleyways with tiny yakitori stalls and bars, authentic local atmosphere.',
          local_tip: 'Each stall seats only 5-6 people, perfect for meeting locals',
          why_hidden: 'Overshadowed by Golden Gai, but more authentic and less touristy'
        },
        {
          place_id: 'tokyo_hidden_3',
          name: 'Nezu Shrine',
          category: ['shrine', 'nature', 'local_favorite'],
          location: { lat: 35.7281, lng: 139.7614 },
          rating: 4.6,
          entry_fee: 0,
          tags: ['hidden_gem', 'azalea', 'peaceful', 'traditional', 'seasonal'],
          description: 'Beautiful shrine famous for azalea tunnel (April-May) and traditional architecture.',
          local_tip: 'Visit during azalea season for stunning pink tunnel photos',
          why_hidden: 'Located in quiet Yanaka district, missed by most tourist routes'
        }
      ],

      // London Hidden Gems
      'london': [
        {
          place_id: 'london_hidden_1',
          name: 'Leadenhall Market',
          category: ['market', 'architecture', 'local_favorite'],
          location: { lat: 51.5133, lng: -0.0833 },
          rating: 4.5,
          entry_fee: 0,
          tags: ['hidden_gem', 'victorian', 'architecture', 'harry_potter', 'food'],
          description: 'Stunning Victorian covered market with ornate roof and unique shops.',
          local_tip: 'Used as Diagon Alley in Harry Potter films',
          why_hidden: 'Hidden in the City financial district, missed by most tourists'
        },
        {
          place_id: 'london_hidden_2',
          name: 'Dennis Severs House',
          category: ['museum', 'experience', 'local_favorite'],
          location: { lat: 51.5197, lng: -0.0728 },
          rating: 4.3,
          entry_fee: 15,
          tags: ['hidden_gem', 'immersive', 'historic', 'unique', 'atmospheric'],
          description: 'Immersive historic house experience - like stepping into 18th century London.',
          local_tip: 'Book the silent night visits for the most atmospheric experience',
          why_hidden: 'Tucked away in Spitalfields, requires advance booking'
        }
      ],

      // New York Hidden Gems
      'new york': [
        {
          place_id: 'ny_hidden_1',
          name: 'The High Line',
          category: ['park', 'local_favorite'],
          location: { lat: 40.7480, lng: -74.0048 },
          rating: 4.6,
          entry_fee: 0,
          tags: ['hidden_gem', 'elevated_park', 'art', 'unique', 'urban'],
          description: 'Elevated linear park built on former railway tracks with art installations.',
          local_tip: 'Enter at Gansevoort Street for the best experience',
          why_hidden: 'While popular now, many tourists still miss this unique park'
        },
        {
          place_id: 'ny_hidden_2',
          name: 'Smorgasburg',
          category: ['market', 'food', 'local_favorite'],
          location: { lat: 40.7081, lng: -73.9571 },
          rating: 4.5,
          entry_fee: 0,
          tags: ['hidden_gem', 'food_market', 'local', 'weekend', 'brooklyn'],
          description: 'Brooklyn food market with 100+ local vendors, weekend only.',
          local_tip: 'Go hungry and try the ramen burger - it started here',
          why_hidden: 'Weekend-only market in Brooklyn, missed by Manhattan-focused tourists'
        }
      ],

      // Rome Hidden Gems
      'rome': [
        {
          place_id: 'rome_hidden_1',
          name: 'Quartiere Coppedè',
          category: ['architecture', 'neighborhood', 'local_favorite'],
          location: { lat: 41.9109, lng: 12.5070 },
          rating: 4.4,
          entry_fee: 0,
          tags: ['hidden_gem', 'art_nouveau', 'architecture', 'fairy_tale', 'unique'],
          description: 'Fairy-tale neighborhood with Art Nouveau and medieval architecture.',
          local_tip: 'Best for photography enthusiasts and architecture lovers',
          why_hidden: 'Far from main tourist circuit, in residential area'
        },
        {
          place_id: 'rome_hidden_2',
          name: 'Centrale Montemartini',
          category: ['museum', 'art', 'local_favorite'],
          location: { lat: 41.8755, lng: 12.4823 },
          rating: 4.6,
          entry_fee: 7,
          tags: ['hidden_gem', 'ancient_art', 'industrial', 'unique', 'contrast'],
          description: 'Ancient Roman sculptures displayed in a former power plant - stunning contrast.',
          local_tip: 'The juxtaposition of classical art and industrial machinery is breathtaking',
          why_hidden: 'Off the beaten path, overshadowed by Vatican and Capitoline museums'
        }
      ],

      // Barcelona Hidden Gems
      'barcelona': [
        {
          place_id: 'barcelona_hidden_1',
          name: 'El Bunker del Carmel',
          category: ['viewpoint', 'local_favorite'],
          location: { lat: 41.4145, lng: 2.1394 },
          rating: 4.7,
          entry_fee: 0,
          tags: ['hidden_gem', 'panoramic_view', 'sunset', 'free', 'local'],
          description: 'Best panoramic view of Barcelona from former anti-aircraft bunker.',
          local_tip: 'Perfect for sunset, bring snacks and drinks',
          why_hidden: 'Requires uphill walk, not well-signposted'
        },
        {
          place_id: 'barcelona_hidden_2',
          name: 'Hospital de Sant Pau',
          category: ['architecture', 'art_nouveau', 'local_favorite'],
          location: { lat: 41.4145, lng: 2.1747 },
          rating: 4.5,
          entry_fee: 15,
          tags: ['hidden_gem', 'modernist', 'architecture', 'unesco', 'peaceful'],
          description: 'Stunning modernist hospital complex, UNESCO World Heritage site.',
          local_tip: 'Less crowded alternative to Sagrada Familia for modernist architecture',
          why_hidden: 'Overshadowed by Gaudí attractions, but equally impressive'
        }
      ]
    };
  }

  getHiddenGems(destination, interests = [], count = 10) {
    const destinationKey = destination.toLowerCase();
    let gems = [];

    // Try exact match first
    if (this.hiddenGems[destinationKey]) {
      gems = [...this.hiddenGems[destinationKey]];
    } else {
      // Try partial matches
      Object.keys(this.hiddenGems).forEach(key => {
        if (destinationKey.includes(key) || key.includes(destinationKey)) {
          gems = [...gems, ...this.hiddenGems[key]];
        }
      });
    }

    // If no specific gems found, create generic ones
    if (gems.length === 0) {
      gems = this.generateGenericHiddenGems(destination, count);
    }

    // Filter by interests if provided
    if (interests.length > 0) {
      const filteredGems = gems.filter(gem => 
        interests.some(interest => 
          gem.tags.includes(interest) || 
          gem.category.includes(interest) ||
          gem.description.toLowerCase().includes(interest.toLowerCase())
        )
      );
      
      if (filteredGems.length > 0) {
        gems = filteredGems;
      }
    }

    // Shuffle and return requested count
    return this.shuffleArray(gems).slice(0, count);
  }

  generateGenericHiddenGems(destination, count) {
    const genericTypes = [
      {
        name: `Local Market in ${destination}`,
        category: ['market', 'local_favorite'],
        tags: ['hidden_gem', 'local', 'authentic', 'food'],
        description: `Authentic local market where residents shop for fresh produce and local specialties.`,
        local_tip: 'Best visited in the morning when it\'s most active'
      },
      {
        name: `Neighborhood Café in ${destination}`,
        category: ['cafe', 'local_favorite'],
        tags: ['hidden_gem', 'local', 'coffee', 'authentic'],
        description: `Family-run café popular with locals, serving traditional coffee and pastries.`,
        local_tip: 'Try the local specialty coffee preparation'
      },
      {
        name: `Artisan Workshop in ${destination}`,
        category: ['workshop', 'culture', 'local_favorite'],
        tags: ['hidden_gem', 'artisan', 'traditional', 'craft'],
        description: `Traditional artisan workshop where you can see local crafts being made.`,
        local_tip: 'Some workshops offer hands-on experiences'
      },
      {
        name: `Local Park in ${destination}`,
        category: ['park', 'local_favorite'],
        tags: ['hidden_gem', 'peaceful', 'local', 'nature'],
        description: `Quiet neighborhood park where locals relax and children play.`,
        local_tip: 'Great for people-watching and experiencing local life'
      },
      {
        name: `Historic Quarter in ${destination}`,
        category: ['neighborhood', 'historic', 'local_favorite'],
        tags: ['hidden_gem', 'historic', 'architecture', 'walking'],
        description: `Historic neighborhood with traditional architecture and local character.`,
        local_tip: 'Best explored on foot with no specific destination in mind'
      }
    ];

    return genericTypes.slice(0, count).map((type, index) => ({
      place_id: `${destination.toLowerCase().replace(/\s+/g, '_')}_hidden_${index}`,
      name: type.name,
      category: type.category,
      location: { lat: 0, lng: 0 },
      rating: 4.2 + Math.random() * 0.6,
      entry_fee: Math.random() > 0.7 ? Math.floor(Math.random() * 15) : 0,
      tags: type.tags,
      description: type.description,
      local_tip: type.local_tip,
      why_hidden: 'Known primarily to locals and rarely featured in guidebooks'
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

  // Mix famous places with hidden gems
  createBalancedPlaceList(famousPlaces, destination, interests, totalNeeded) {
    const hiddenGems = this.getHiddenGems(destination, interests, Math.ceil(totalNeeded * 0.4)); // 40% hidden gems
    const famousCount = Math.floor(totalNeeded * 0.6); // 60% famous places
    
    const selectedFamous = famousPlaces.slice(0, famousCount);
    
    // Interleave famous and hidden places
    const balanced = [];
    const maxLength = Math.max(selectedFamous.length, hiddenGems.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (i < selectedFamous.length) {
        balanced.push({ ...selectedFamous[i], type: 'famous' });
      }
      if (i < hiddenGems.length) {
        balanced.push({ ...hiddenGems[i], type: 'hidden_gem' });
      }
    }
    
    return this.shuffleArray(balanced).slice(0, totalNeeded);
  }
}

module.exports = new HiddenGemsService();