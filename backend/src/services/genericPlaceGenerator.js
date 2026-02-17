const logger = require('../utils/logger');

/**
 * Generic Place Generator
 * Generates realistic place names when APIs fail
 */
class GenericPlaceGenerator {
  constructor() {
    this.placeTemplates = {
      museum: [
        '{destination} National Museum',
        '{destination} Art Museum',
        '{destination} History Museum',
        'Museum of {destination} Culture',
        '{destination} Contemporary Art Gallery',
        '{destination} Archaeological Museum',
        'Modern Art Museum of {destination}',
        '{destination} Science Museum'
      ],
      restaurant: [
        '{destination} Traditional Restaurant',
        'Local Cuisine at {destination}',
        '{destination} Fine Dining',
        'Authentic {destination} Eatery',
        '{destination} Street Food Market',
        'Gourmet Restaurant in {destination}',
        '{destination} Seafood Restaurant',
        'Traditional {destination} Bistro'
      ],
      park: [
        '{destination} Central Park',
        '{destination} Botanical Gardens',
        '{destination} City Park',
        '{destination} National Park',
        '{destination} Riverside Park',
        '{destination} Memorial Park',
        '{destination} Public Gardens',
        '{destination} Nature Reserve'
      ],
      landmark: [
        '{destination} Historic Center',
        '{destination} Old Town',
        '{destination} Main Square',
        '{destination} Cathedral',
        '{destination} City Hall',
        '{destination} Monument',
        '{destination} Historic District',
        '{destination} Cultural Center'
      ],
      shopping: [
        '{destination} Shopping District',
        '{destination} Local Market',
        '{destination} Artisan Market',
        '{destination} Shopping Mall',
        '{destination} Craft Market',
        '{destination} Souvenir Shops',
        '{destination} Fashion District',
        '{destination} Flea Market'
      ],
      beach: [
        '{destination} Beach',
        '{destination} Waterfront',
        '{destination} Coastal Walk',
        '{destination} Marina',
        '{destination} Beachfront',
        '{destination} Seaside Promenade',
        '{destination} Beach Resort Area',
        '{destination} Ocean View Point'
      ],
      viewpoint: [
        '{destination} Viewpoint',
        '{destination} Observation Deck',
        '{destination} Panoramic View',
        '{destination} Lookout Point',
        '{destination} Scenic Overlook',
        '{destination} Tower View',
        '{destination} Hill Viewpoint',
        '{destination} Sunset Point'
      ],
      entertainment: [
        '{destination} Theater',
        '{destination} Concert Hall',
        '{destination} Entertainment District',
        '{destination} Cultural Center',
        '{destination} Performance Venue',
        '{destination} Cinema Complex',
        '{destination} Music Hall',
        '{destination} Arts Center'
      ]
    };
  }

  /**
   * Generate places for a destination
   */
  generatePlaces(destination, count, interests = []) {
    logger.info(`🎨 Generating ${count} generic places for ${destination}`);
    
    const places = [];
    const usedNames = new Set();
    
    // Determine categories based on interests
    let categories = Object.keys(this.placeTemplates);
    
    // Prioritize categories based on interests
    if (interests.length > 0) {
      const interestCategoryMap = {
        'art': 'museum',
        'culture': 'landmark',
        'history': 'museum',
        'food': 'restaurant',
        'nature': 'park',
        'beach': 'beach',
        'shopping': 'shopping',
        'entertainment': 'entertainment',
        'scenic': 'viewpoint'
      };
      
      const priorityCategories = interests
        .map(interest => interestCategoryMap[interest.toLowerCase()])
        .filter(cat => cat);
      
      if (priorityCategories.length > 0) {
        categories = [...new Set([...priorityCategories, ...categories])];
      }
    }
    
    let categoryIndex = 0;
    
    for (let i = 0; i < count; i++) {
      const category = categories[categoryIndex % categories.length];
      const templates = this.placeTemplates[category];
      const templateIndex = Math.floor(i / categories.length) % templates.length;
      const template = templates[templateIndex];
      
      let name = template.replace('{destination}', destination);
      
      // Ensure unique names
      let suffix = 1;
      let uniqueName = name;
      while (usedNames.has(uniqueName)) {
        uniqueName = `${name} ${suffix}`;
        suffix++;
      }
      usedNames.add(uniqueName);
      
      const place = {
        place_id: `generic_${destination.toLowerCase().replace(/\s+/g, '_')}_${i}`,
        name: uniqueName,
        category: [category, 'tourist_attraction'],
        location: { 
          lat: this.generateRandomCoordinate(-90, 90), 
          lng: this.generateRandomCoordinate(-180, 180) 
        },
        rating: 3.5 + Math.random() * 1.5, // 3.5 to 5.0
        entry_fee: this.generateEntryFee(category),
        tags: this.generateTags(category),
        description: `Popular ${category} in ${destination}`,
        source: 'generated'
      };
      
      places.push(place);
      categoryIndex++;
    }
    
    logger.info(`✅ Generated ${places.length} generic places`);
    return places;
  }

  generateRandomCoordinate(min, max) {
    return min + Math.random() * (max - min);
  }

  generateEntryFee(category) {
    const feeRanges = {
      museum: [10, 30],
      restaurant: [15, 50],
      park: [0, 10],
      landmark: [5, 25],
      shopping: [0, 0],
      beach: [0, 5],
      viewpoint: [0, 15],
      entertainment: [20, 60]
    };
    
    const range = feeRanges[category] || [0, 20];
    return Math.floor(range[0] + Math.random() * (range[1] - range[0]));
  }

  generateTags(category) {
    const tagMap = {
      museum: ['culture', 'art', 'history', 'educational'],
      restaurant: ['food', 'dining', 'local_cuisine'],
      park: ['nature', 'outdoor', 'relaxation'],
      landmark: ['historic', 'famous', 'must_see'],
      shopping: ['shopping', 'souvenirs', 'local_products'],
      beach: ['beach', 'water', 'relaxation'],
      viewpoint: ['scenic', 'photography', 'panoramic'],
      entertainment: ['entertainment', 'culture', 'nightlife']
    };
    
    return tagMap[category] || ['tourist_attraction'];
  }
}

module.exports = new GenericPlaceGenerator();
