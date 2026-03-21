const axios = require('axios');
const logger = require('../utils/logger');

class OpenStreetMapService {
  constructor() {
    this.nominatimUrl = 'https://nominatim.openstreetmap.org';
    this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    this.userAgent = 'VoyageMind/1.0 (contact@voyagemind.com)';
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests (OSM requirement)
  }

  // Respect rate limiting
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      logger.info(`⏳ Waiting ${waitTime}ms to respect OpenStreetMap rate limit...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  // Geocode a location to get coordinates
  async geocodeLocation(location) {
    try {
      await this.waitForRateLimit(); // Respect rate limiting
      
      logger.info(`🔍 Geocoding location: ${location}`);
      
      const response = await axios.get(`${this.nominatimUrl}/search`, {
        params: {
          q: location,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 10000 // 10 second timeout
      });

      logger.info(`📡 Geocoding response status: ${response.status}`);
      logger.info(`📊 Geocoding results count: ${response.data?.length || 0}`);

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        logger.info(`✅ Location found: ${result.display_name}`);
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          display_name: result.display_name,
          place_id: result.place_id
        };
      }
      throw new Error(`Location not found: ${location}`);
    } catch (error) {
      logger.error(`❌ Geocoding error for "${location}":`, error.message);
      if (error.response) {
        logger.error(`Response status: ${error.response.status}`);
        logger.error(`Response data:`, error.response.data);
      }
      throw error;
    }
  }

  // Get places of interest near a location
  async getPlacesNearby(lat, lng, radius = 5000, interests = []) {
    try {
      await this.waitForRateLimit(); // Respect rate limiting
      
      // Map interests to OSM tags
      const osmTags = this.mapInterestsToOSMTags(interests);
      
      // Build Overpass query
      const query = this.buildOverpassQuery(lat, lng, radius, osmTags);
      
      logger.info(`🗺️ Fetching places from OpenStreetMap near ${lat},${lng}`);
      
      const response = await axios.post(this.overpassUrl, query, {
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': this.userAgent
        },
        timeout: 15000
      });

      const places = this.parseOverpassResponse(response.data);
      logger.info(`✅ Found ${places.length} places from OpenStreetMap`);
      
      return places;
    } catch (error) {
      logger.error('OpenStreetMap places fetch error:', error.message);
      return [];
    }
  }

  // Map user interests to OSM tags
  mapInterestsToOSMTags(interests) {
    const tagMapping = {
      'art': ['tourism=museum', 'tourism=gallery', 'tourism=artwork'],
      'culture': ['tourism=museum', 'historic=monument', 'amenity=theatre'],
      'history': ['historic=monument', 'historic=castle', 'tourism=museum'],
      'food': ['amenity=restaurant', 'amenity=cafe', 'amenity=fast_food'],
      'nature': ['leisure=park', 'leisure=garden', 'natural=beach'],
      'shopping': ['shop=mall', 'shop=department_store', 'tourism=attraction'],
      'entertainment': ['amenity=cinema', 'amenity=theatre', 'leisure=amusement_arcade'],
      'architecture': ['historic=building', 'building=cathedral', 'tourism=attraction'],
      'religious': ['amenity=place_of_worship', 'building=church', 'building=temple']
    };

    let tags = [];
    
    if (interests.length === 0) {
      // Default tags if no interests specified
      tags = [
        'tourism=attraction',
        'tourism=museum',
        'historic=monument',
        'leisure=park',
        'amenity=restaurant'
      ];
    } else {
      interests.forEach(interest => {
        if (tagMapping[interest.toLowerCase()]) {
          tags = [...tags, ...tagMapping[interest.toLowerCase()]];
        }
      });
      
      // Add some default attractions
      tags.push('tourism=attraction');
    }

    // Remove duplicates
    return [...new Set(tags)];
  }

  // Build Overpass API query - COMPREHENSIVE QUERY FOR ALL TYPES
  buildOverpassQuery(lat, lng, radius, tags) {
    const radiusInMeters = Math.min(radius, 8000); // Increased to 8km for better coverage
    
    // COMPREHENSIVE QUERY - Get attractions, restaurants, cafes, local gems
    return `
      [out:json][timeout:25];
      (
        node["tourism"="attraction"](around:${radiusInMeters},${lat},${lng});
        way["tourism"="attraction"](around:${radiusInMeters},${lat},${lng});
        node["tourism"="museum"](around:${radiusInMeters},${lat},${lng});
        way["tourism"="museum"](around:${radiusInMeters},${lat},${lng});
        node["tourism"="gallery"](around:${radiusInMeters},${lat},${lng});
        node["historic"="monument"](around:${radiusInMeters},${lat},${lng});
        way["historic"="monument"](around:${radiusInMeters},${lat},${lng});
        node["historic"="castle"](around:${radiusInMeters},${lat},${lng});
        way["historic"="castle"](around:${radiusInMeters},${lat},${lng});
        node["historic"="memorial"](around:${radiusInMeters},${lat},${lng});
        node["leisure"="park"](around:${radiusInMeters},${lat},${lng});
        way["leisure"="park"](around:${radiusInMeters},${lat},${lng});
        node["leisure"="garden"](around:${radiusInMeters},${lat},${lng});
        node["amenity"="restaurant"]["name"](around:${radiusInMeters},${lat},${lng});
        node["amenity"="cafe"]["name"](around:${radiusInMeters},${lat},${lng});
        node["amenity"="bar"]["name"](around:${radiusInMeters},${lat},${lng});
        node["shop"="mall"](around:${radiusInMeters},${lat},${lng});
        node["natural"="beach"](around:${radiusInMeters},${lat},${lng});
        node["tourism"="viewpoint"](around:${radiusInMeters},${lat},${lng});
      );
      out center 200;
    `;
  }

  // Parse Overpass API response
  parseOverpassResponse(data) {
    if (!data.elements || data.elements.length === 0) {
      return [];
    }

    const places = data.elements
      .filter(element => element.tags && (element.tags.name || element.tags['name:en']))
      .map(element => {
        const tags = element.tags;
        
        // FORCE ENGLISH NAME - Prefer English, fallback to transliterated name
        let name = tags['name:en'] || tags['int_name'] || tags['official_name:en'] || tags['alt_name:en'] || tags.name;
        
        // Handle both nodes and ways (ways have center coordinates)
        const lat = element.lat || element.center?.lat;
        const lng = element.lon || element.center?.lon;
        
        if (!lat || !lng) return null; // Skip if no coordinates
        
        // CRITICAL: Skip places with non-Latin characters (Korean, Japanese, Chinese, etc.)
        if (name && /[^\x00-\x7F]/.test(name)) {
          logger.debug(`⏭️ Skipping place with non-Latin name: ${name}`);
          return null;
        }
        
        // Skip if name is too short or generic
        if (!name || name.length < 3) {
          return null;
        }
        
        // Extract city/district for display
        const city = tags['addr:city:en'] || tags['addr:city'] || 
                     tags['addr:district:en'] || tags['addr:district'] ||
                     tags['addr:suburb:en'] || tags['addr:suburb'];
        
        // Filter out non-Latin city names
        const cleanCity = (city && !/[^\x00-\x7F]/.test(city)) ? city : null;
        
        return {
          place_id: `osm_${element.type}_${element.id}`,
          name: name,
          category: this.extractCategories(tags),
          location: { lat, lng },
          rating: this.estimateRating(tags),
          entry_fee: this.estimateEntryFee(tags),
          tags: this.extractTags(tags),
          description: this.generateDescription(tags, name),
          source: 'openstreetmap',
          opening_hours: tags.opening_hours || null,
          website: tags.website || null,
          phone: tags.phone || null,
          address: this.formatAddress(tags),
          city: cleanCity // Add city field directly
        };
      })
      .filter(place => place !== null); // Remove nulls

    return places;
  }

  // Simple transliteration helper (basic romanization)
  transliterateName(name) {
    // This is a basic fallback - in production you'd use a proper transliteration library
    // For now, just return the original name if it has non-Latin characters
    return name;
  }

  // Extract categories from OSM tags
  extractCategories(tags) {
    const categories = [];
    
    if (tags.tourism) categories.push(tags.tourism);
    if (tags.historic) categories.push('historic');
    if (tags.amenity) categories.push(tags.amenity);
    if (tags.leisure) categories.push(tags.leisure);
    if (tags.shop) categories.push('shopping');
    
    return categories.length > 0 ? categories : ['attraction'];
  }

  // Extract relevant tags
  extractTags(tags) {
    const relevantTags = [];
    
    if (tags.tourism) relevantTags.push(tags.tourism);
    if (tags.historic) relevantTags.push('historic');
    if (tags.unesco === 'yes') relevantTags.push('unesco');
    if (tags.wheelchair === 'yes') relevantTags.push('accessible');
    if (tags.fee === 'no') relevantTags.push('free');
    if (tags.cuisine) relevantTags.push(tags.cuisine);
    
    return relevantTags;
  }

  // Estimate rating based on tags
  estimateRating(tags) {
    let rating = 4.0;
    
    if (tags.unesco === 'yes') rating += 0.5;
    if (tags.heritage) rating += 0.3;
    if (tags.wikipedia) rating += 0.2;
    if (tags.wikidata) rating += 0.1;
    
    return Math.min(rating, 5.0);
  }

  // Estimate entry fee
  estimateEntryFee(tags) {
    if (tags.fee === 'no') return 0;
    if (tags.fee === 'yes') {
      if (tags.tourism === 'museum') return 10;
      if (tags.historic === 'castle') return 15;
      return 5;
    }
    
    // Default estimates
    if (tags.tourism === 'museum') return 8;
    if (tags.tourism === 'attraction') return 5;
    if (tags.amenity === 'restaurant') return 0;
    
    return 0;
  }

  // Generate description
  generateDescription(tags, name) {
    // Use English description if available
    let description = tags['description:en'] || tags.description;
    
    if (description) {
      return description;
    }
    
    // Generate English description
    let desc = name || 'Point of interest';
    
    if (tags.tourism === 'museum') {
      desc = `Museum featuring exhibits and collections`;
    } else if (tags.tourism === 'attraction') {
      desc = `Popular tourist attraction`;
    } else if (tags.historic === 'monument') {
      desc = `Historic monument with cultural significance`;
    } else if (tags.historic === 'castle') {
      desc = `Historic castle and fortress`;
    } else if (tags.amenity === 'restaurant') {
      desc = `Restaurant serving ${tags.cuisine || 'local'} cuisine`;
    } else if (tags.amenity === 'cafe') {
      desc = `Cozy cafe perfect for coffee and snacks`;
    } else if (tags.leisure === 'park') {
      desc = `Beautiful park for relaxation and leisure`;
    }
    
    if (tags.wikipedia) {
      desc += '. Notable landmark with detailed history';
    }
    
    return desc;
  }

  // Format address - Extract city/district in English
  formatAddress(tags) {
    const parts = [];
    
    // Try to get English versions first
    const street = tags['addr:street:en'] || tags['addr:street'];
    const city = tags['addr:city:en'] || tags['addr:city'];
    const district = tags['addr:district:en'] || tags['addr:district'];
    const state = tags['addr:state:en'] || tags['addr:state'];
    const country = tags['addr:country:en'] || tags['addr:country'];
    
    // Build address with available parts (skip non-Latin characters)
    if (street && !/[^\x00-\x7F]/.test(street)) parts.push(street);
    if (district && !/[^\x00-\x7F]/.test(district)) parts.push(district);
    if (city && !/[^\x00-\x7F]/.test(city)) parts.push(city);
    if (state && !/[^\x00-\x7F]/.test(state)) parts.push(state);
    if (country && !/[^\x00-\x7F]/.test(country)) parts.push(country);
    
    return parts.length > 0 ? parts.join(', ') : null;
  }

  // Main method to get places for a destination
  async getRealPlacesForDestination(destination, interests = [], maxPlaces = 30) {
    try {
      logger.info(`🌍 Fetching real places from OpenStreetMap for: ${destination}`);
      
      // Check if destination is a country - if so, use capital city
      const adjustedDestination = this.getSpecificLocation(destination);
      if (adjustedDestination !== destination) {
        logger.info(`🎯 Country detected! Using ${adjustedDestination} instead of ${destination}`);
      }
      
      // Step 1: Geocode the destination
      const location = await this.geocodeLocation(adjustedDestination);
      logger.info(`📍 Location found: ${location.display_name}`);
      
      // Step 2: Get places nearby
      const places = await this.getPlacesNearby(location.lat, location.lng, 10000, interests);
      
      // Step 3: Sort by rating and limit
      const sortedPlaces = places
        .sort((a, b) => b.rating - a.rating)
        .slice(0, maxPlaces);
      
      logger.info(`✅ Returning ${sortedPlaces.length} real places from OpenStreetMap`);
      
      return sortedPlaces;
    } catch (error) {
      logger.error('Failed to get places from OpenStreetMap:', error.message);
      return [];
    }
  }

  // Convert country names to specific cities for better results
  getSpecificLocation(destination) {
    const countryToCityMap = {
      'south korea': 'Seoul, South Korea',
      'korea': 'Seoul, South Korea',
      'japan': 'Tokyo, Japan',
      'italy': 'Rome, Italy',
      'france': 'Paris, France',
      'spain': 'Barcelona, Spain',
      'germany': 'Berlin, Germany',
      'uk': 'London, UK',
      'united kingdom': 'London, UK',
      'usa': 'New York, USA',
      'united states': 'New York, USA',
      'america': 'New York, USA',
      'india': 'Delhi, India',
      'china': 'Beijing, China',
      'thailand': 'Bangkok, Thailand',
      'brazil': 'Rio de Janeiro, Brazil',
      'australia': 'Sydney, Australia',
      'canada': 'Toronto, Canada',
      'mexico': 'Mexico City, Mexico'
    };
    
    const lowerDest = destination.toLowerCase().trim();
    return countryToCityMap[lowerDest] || destination;
  }
}

module.exports = new OpenStreetMapService();
