const logger = require('../utils/logger');

class WeatherOptimizer {
  constructor() {
    this.indoorCategories = [
      'museum', 'art_gallery', 'shopping', 'restaurant', 'cafe', 'theater', 
      'cinema', 'library', 'aquarium', 'indoor_market', 'spa', 'cultural_center'
    ];
    
    this.outdoorCategories = [
      'park', 'garden', 'beach', 'hiking', 'outdoor_market', 'monument', 
      'viewpoint', 'bridge', 'square', 'waterfront', 'zoo', 'stadium'
    ];
  }

  async optimizeForWeather(itinerary, weatherForecast, allPlaces) {
    logger.info('Optimizing itinerary for weather conditions');
    
    const optimizedPlan = [];
    const adjustments = [];

    for (const dayPlan of itinerary.plan) {
      const dayWeather = weatherForecast.find(w => w.day === dayPlan.day);
      
      if (!dayWeather) {
        optimizedPlan.push(dayPlan);
        continue;
      }

      const optimizedDay = {
        day: dayPlan.day,
        places: []
      };

      for (const place of dayPlan.places) {
        if (this.shouldReplaceForWeather(place, dayWeather)) {
          // Find indoor alternative
          const replacement = this.findIndoorAlternative(place, allPlaces, dayWeather);
          
          if (replacement) {
            optimizedDay.places.push({
              ...replacement,
              start_time: place.start_time,
              end_time: place.end_time,
              notes: `${replacement.notes || ''} (Weather-adjusted: ${dayWeather.description})`
            });

            adjustments.push({
              day: dayPlan.day,
              original_place_id: place.place_id,
              original_name: place.name,
              replacement_place_id: replacement.place_id,
              replacement_name: replacement.name,
              reason: this.getWeatherReason(dayWeather),
              weather_condition: dayWeather.condition
            });
          } else {
            // Keep original if no suitable replacement found
            optimizedDay.places.push({
              ...place,
              notes: `${place.notes || ''} (Weather warning: ${dayWeather.description})`
            });
          }
        } else {
          // Keep original place
          optimizedDay.places.push(place);
        }
      }

      optimizedPlan.push(optimizedDay);
    }

    return {
      optimized_itinerary: {
        ...itinerary,
        plan: optimizedPlan
      },
      weather_adjustments: adjustments,
      weather_forecast: weatherForecast
    };
  }

  shouldReplaceForWeather(place, weather) {
    if (!weather.is_bad_weather) return false;

    // Check if place is outdoor
    const isOutdoor = this.isOutdoorPlace(place);
    
    // Replace outdoor activities in bad weather
    if (isOutdoor && (
      weather.condition === 'rain' ||
      weather.condition === 'thunderstorm' ||
      weather.condition === 'snow' ||
      weather.precipitation > 5 ||
      weather.max_temp > 35 ||
      weather.min_temp < 0
    )) {
      return true;
    }

    return false;
  }

  isOutdoorPlace(place) {
    const categories = place.category || [];
    const tags = place.tags || [];
    
    // Check categories
    const hasOutdoorCategory = categories.some(cat => 
      this.outdoorCategories.includes(cat)
    );
    
    // Check tags
    const hasOutdoorTags = tags.some(tag => 
      ['outdoor', 'park', 'garden', 'beach', 'hiking', 'monument'].includes(tag)
    );

    return hasOutdoorCategory || hasOutdoorTags;
  }

  findIndoorAlternative(originalPlace, allPlaces, weather) {
    // Filter indoor places
    const indoorPlaces = allPlaces.filter(place => this.isIndoorPlace(place));
    
    if (indoorPlaces.length === 0) {
      return this.createGenericIndoorAlternative(originalPlace, weather);
    }

    // Find best match based on:
    // 1. Similar category/interest
    // 2. Similar rating
    // 3. Similar price range
    let bestMatch = null;
    let bestScore = 0;

    for (const place of indoorPlaces) {
      const score = this.calculateReplacementScore(originalPlace, place);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = place;
      }
    }

    return bestMatch || this.createGenericIndoorAlternative(originalPlace, weather);
  }

  isIndoorPlace(place) {
    const categories = place.category || [];
    const tags = place.tags || [];
    
    // Check categories
    const hasIndoorCategory = categories.some(cat => 
      this.indoorCategories.includes(cat)
    );
    
    // Check tags
    const hasIndoorTags = tags.some(tag => 
      ['indoor', 'museum', 'gallery', 'shopping', 'restaurant', 'cafe'].includes(tag)
    );

    return hasIndoorCategory || hasIndoorTags;
  }

  calculateReplacementScore(original, candidate) {
    let score = 0;

    // Category similarity
    const originalCategories = new Set(original.category || []);
    const candidateCategories = new Set(candidate.category || []);
    const categoryOverlap = [...originalCategories].filter(cat => candidateCategories.has(cat)).length;
    score += categoryOverlap * 0.3;

    // Rating similarity
    const ratingDiff = Math.abs((original.rating || 0) - (candidate.rating || 0));
    score += Math.max(0, 1 - ratingDiff / 5) * 0.2;

    // Price similarity
    const priceDiff = Math.abs((original.entry_fee || 0) - (candidate.entry_fee || 0));
    score += Math.max(0, 1 - priceDiff / 50) * 0.2;

    // Tag similarity
    const originalTags = new Set(original.tags || []);
    const candidateTags = new Set(candidate.tags || []);
    const tagOverlap = [...originalTags].filter(tag => candidateTags.has(tag)).length;
    score += tagOverlap * 0.1;

    // Prefer highly rated places
    score += (candidate.rating || 0) / 5 * 0.2;

    return score;
  }

  createGenericIndoorAlternative(originalPlace, weather) {
    // Create a generic indoor alternative based on the original place type
    const alternatives = {
      'park': {
        name: 'Indoor Garden Center',
        category: ['garden', 'indoor'],
        tags: ['indoor', 'plants', 'relaxing'],
        description: 'Indoor botanical experience'
      },
      'monument': {
        name: 'Local History Museum',
        category: ['museum', 'history'],
        tags: ['indoor', 'history', 'culture'],
        description: 'Learn about local history and culture'
      },
      'viewpoint': {
        name: 'Observation Deck (Indoor)',
        category: ['viewpoint', 'indoor'],
        tags: ['indoor', 'views', 'panoramic'],
        description: 'Indoor viewing area with panoramic views'
      },
      'market': {
        name: 'Indoor Shopping Center',
        category: ['shopping', 'indoor'],
        tags: ['indoor', 'shopping', 'food'],
        description: 'Climate-controlled shopping and dining'
      }
    };

    const originalCategory = originalPlace.category?.[0] || 'tourist_attraction';
    const alternative = alternatives[originalCategory] || alternatives['monument'];

    return {
      place_id: `weather_alt_${originalPlace.place_id}`,
      name: alternative.name,
      category: alternative.category,
      location: originalPlace.location,
      rating: 4.0,
      entry_fee: originalPlace.entry_fee || 15,
      tags: alternative.tags,
      description: alternative.description,
      notes: `Weather alternative for ${originalPlace.name}`
    };
  }

  getWeatherReason(weather) {
    if (weather.condition === 'rain' || weather.condition === 'drizzle') {
      return `Rainy weather expected (${weather.precipitation}mm precipitation)`;
    }
    if (weather.condition === 'thunderstorm') {
      return 'Thunderstorm forecast - moved to indoor activity';
    }
    if (weather.condition === 'snow') {
      return 'Snow expected - switched to indoor alternative';
    }
    if (weather.max_temp > 35) {
      return `Very hot weather (${weather.max_temp}°C) - indoor activity recommended`;
    }
    if (weather.min_temp < 0) {
      return `Freezing temperatures (${weather.min_temp}°C) - indoor alternative chosen`;
    }
    if (weather.precipitation > 5) {
      return `Heavy precipitation expected (${weather.precipitation}mm)`;
    }
    
    return `Unfavorable weather conditions (${weather.description})`;
  }

  // Analyze weather impact on different activity types
  getWeatherImpactAnalysis(weatherForecast) {
    const analysis = {
      overall_suitability: 'good',
      daily_recommendations: [],
      weather_warnings: []
    };

    let badWeatherDays = 0;

    weatherForecast.forEach(dayWeather => {
      const dayAnalysis = {
        day: dayWeather.day,
        condition: dayWeather.condition,
        temperature: dayWeather.temperature,
        suitability: 'good',
        recommended_activities: [],
        avoid_activities: []
      };

      if (dayWeather.is_bad_weather) {
        badWeatherDays++;
        dayAnalysis.suitability = 'poor';
        dayAnalysis.recommended_activities = ['museums', 'galleries', 'shopping', 'restaurants', 'indoor attractions'];
        dayAnalysis.avoid_activities = ['parks', 'outdoor monuments', 'hiking', 'outdoor markets'];
        
        analysis.weather_warnings.push({
          day: dayWeather.day,
          warning: this.getWeatherReason(dayWeather)
        });
      } else {
        dayAnalysis.recommended_activities = ['outdoor sightseeing', 'parks', 'walking tours', 'outdoor dining'];
      }

      analysis.daily_recommendations.push(dayAnalysis);
    });

    // Overall suitability
    const badWeatherRatio = badWeatherDays / weatherForecast.length;
    if (badWeatherRatio > 0.6) {
      analysis.overall_suitability = 'poor';
    } else if (badWeatherRatio > 0.3) {
      analysis.overall_suitability = 'fair';
    }

    return analysis;
  }
}

module.exports = new WeatherOptimizer();