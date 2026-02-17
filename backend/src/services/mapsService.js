const axios = require('axios');
const redis = require('redis');
const logger = require('../utils/logger');

class MapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
    this.redisClient = null;
    this.initRedis();
  }

  async initRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redisClient = redis.createClient({ url: process.env.REDIS_URL });
        await this.redisClient.connect();
        logger.info('Connected to Redis for maps caching');
      }
    } catch (error) {
      logger.warn('Redis connection failed, using in-memory cache:', error.message);
      this.cache = new Map();
    }
  }

  async getFromCache(key) {
    try {
      if (this.redisClient) {
        const cached = await this.redisClient.get(key);
        return cached ? JSON.parse(cached) : null;
      } else if (this.cache) {
        const cached = this.cache.get(key);
        if (cached && cached.expires > Date.now()) {
          return cached.data;
        }
        this.cache.delete(key);
      }
    } catch (error) {
      logger.error('Cache get error:', error);
    }
    return null;
  }

  async setCache(key, data, ttlHours = 24) {
    try {
      if (this.redisClient) {
        await this.redisClient.setEx(key, ttlHours * 3600, JSON.stringify(data));
      } else if (this.cache) {
        this.cache.set(key, {
          data,
          expires: Date.now() + (ttlHours * 3600 * 1000)
        });
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async geocode(address) {
    const cacheKey = `geocode:${address}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address,
          key: this.apiKey
        }
      });

      const result = response.data.results[0];
      if (!result) {
        throw new Error('Location not found');
      }

      const geocoded = {
        place_id: result.place_id,
        formatted_address: result.formatted_address,
        location: result.geometry.location,
        types: result.types
      };

      await this.setCache(cacheKey, geocoded);
      return geocoded;
    } catch (error) {
      logger.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  async searchPlaces(query, location, radius = 5000) {
    const cacheKey = `places:${query}:${location.lat}:${location.lng}:${radius}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/place/nearbysearch/json`, {
        params: {
          location: `${location.lat},${location.lng}`,
          radius,
          keyword: query,
          key: this.apiKey
        }
      });

      const places = response.data.results.map(place => ({
        place_id: place.place_id,
        name: place.name,
        category: place.types || [],
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        rating: place.rating || 0,
        entry_fee: 0, // Default, would need additional API call for details
        tags: place.types || [],
        image_url: place.photos?.[0] ? 
          `${this.baseUrl}/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${this.apiKey}` : 
          null
      }));

      await this.setCache(cacheKey, places, 6); // Cache for 6 hours
      return places;
    } catch (error) {
      logger.error('Places search error:', error);
      throw new Error('Failed to search places');
    }
  }

  async getPlaceDetails(placeId) {
    const cacheKey = `place_details:${placeId}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/place/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,rating,formatted_phone_number,opening_hours,website,price_level,photos,geometry,types',
          key: this.apiKey
        }
      });

      const place = response.data.result;
      const details = {
        place_id: placeId,
        name: place.name,
        category: place.types || [],
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        rating: place.rating || 0,
        opening_hours: this.parseOpeningHours(place.opening_hours),
        entry_fee: this.estimateEntryFee(place.price_level),
        tags: place.types || [],
        phone: place.formatted_phone_number,
        website: place.website,
        image_url: place.photos?.[0] ? 
          `${this.baseUrl}/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${this.apiKey}` : 
          null
      };

      await this.setCache(cacheKey, details);
      return details;
    } catch (error) {
      logger.error('Place details error:', error);
      throw new Error('Failed to get place details');
    }
  }

  async getDistanceMatrix(origins, destinations) {
    const originsStr = origins.map(o => `${o.lat},${o.lng}`).join('|');
    const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');
    const cacheKey = `distance_matrix:${originsStr}:${destinationsStr}`;
    
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/distancematrix/json`, {
        params: {
          origins: originsStr,
          destinations: destinationsStr,
          units: 'metric',
          mode: 'walking',
          key: this.apiKey
        }
      });

      const matrix = response.data.rows.map(row => 
        row.elements.map(element => ({
          distance: element.distance?.value || 0,
          duration: element.duration?.value || 0,
          status: element.status
        }))
      );

      await this.setCache(cacheKey, matrix, 12); // Cache for 12 hours
      return matrix;
    } catch (error) {
      logger.error('Distance matrix error:', error);
      throw new Error('Failed to get distance matrix');
    }
  }

  parseOpeningHours(openingHours) {
    if (!openingHours || !openingHours.periods) {
      return {};
    }

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const hours = {};

    openingHours.periods.forEach(period => {
      const day = days[period.open.day];
      hours[day] = {
        open: period.open.time,
        close: period.close?.time || '2359'
      };
    });

    return hours;
  }

  estimateEntryFee(priceLevel) {
    const priceLevels = {
      0: 0,    // Free
      1: 10,   // Inexpensive
      2: 25,   // Moderate
      3: 50,   // Expensive
      4: 100   // Very Expensive
    };
    return priceLevels[priceLevel] || 0;
  }
}

module.exports = new MapsService();