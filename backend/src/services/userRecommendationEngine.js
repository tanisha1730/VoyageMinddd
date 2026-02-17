const logger = require('../utils/logger');
const Itinerary = require('../models/Itinerary');

/**
 * User Recommendation Engine
 * Learns from user's past itineraries and searches to provide personalized recommendations
 */
class UserRecommendationEngine {
  
  /**
   * Analyze user's travel history and preferences
   */
  async analyzeUserProfile(userId) {
    try {
      logger.info(`🔍 Analyzing travel profile for user: ${userId}`);
      
      // Get user's past itineraries
      const itineraries = await Itinerary.find({ user_id: userId })
        .sort({ created_at: -1 })
        .limit(20)
        .lean();
      
      if (itineraries.length === 0) {
        logger.info(`📊 New user - no travel history yet`);
        return this.getDefaultProfile();
      }
      
      // Extract patterns
      const profile = {
        destinations: this.extractDestinations(itineraries),
        interests: this.extractInterests(itineraries),
        budgetRange: this.analyzeBudgetPattern(itineraries),
        tripDuration: this.analyzeTripDuration(itineraries),
        seasonalPreferences: this.analyzeSeasonalPreferences(itineraries),
        placeCategories: this.analyzePlaceCategories(itineraries),
        totalTrips: itineraries.length,
        lastTripDate: itineraries[0]?.created_at
      };
      
      logger.info(`✅ User profile analyzed: ${profile.totalTrips} trips, top interests: ${profile.interests.slice(0, 3).join(', ')}`);
      
      return profile;
    } catch (error) {
      logger.error(`❌ Failed to analyze user profile:`, error);
      return this.getDefaultProfile();
    }
  }
  
  /**
   * Extract destinations user has visited
   */
  extractDestinations(itineraries) {
    const destinationCount = {};
    
    itineraries.forEach(itin => {
      const dest = itin.destination;
      destinationCount[dest] = (destinationCount[dest] || 0) + 1;
    });
    
    // Sort by frequency
    return Object.entries(destinationCount)
      .sort((a, b) => b[1] - a[1])
      .map(([dest, count]) => ({ destination: dest, visits: count }));
  }
  
  /**
   * Extract interests from past trips
   */
  extractInterests(itineraries) {
    const interestCount = {};
    
    itineraries.forEach(itin => {
      // From parsed query interests
      if (itin.parsed_query?.interests) {
        itin.parsed_query.interests.forEach(interest => {
          interestCount[interest] = (interestCount[interest] || 0) + 1;
        });
      }
      
      // From place categories
      if (itin.plan) {
        itin.plan.forEach(day => {
          day.places?.forEach(place => {
            place.category?.forEach(cat => {
              interestCount[cat] = (interestCount[cat] || 0) + 1;
            });
            place.tags?.forEach(tag => {
              interestCount[tag] = (interestCount[tag] || 0) + 1;
            });
          });
        });
      }
    });
    
    // Sort by frequency and return top interests
    return Object.entries(interestCount)
      .sort((a, b) => b[1] - a[1])
      .map(([interest]) => interest)
      .slice(0, 10);
  }
  
  /**
   * Analyze budget patterns
   */
  analyzeBudgetPattern(itineraries) {
    const budgets = itineraries.map(i => i.budget).filter(b => b > 0);
    
    if (budgets.length === 0) {
      return { min: 500, max: 2000, average: 1000, level: 'medium' };
    }
    
    const average = budgets.reduce((a, b) => a + b, 0) / budgets.length;
    const min = Math.min(...budgets);
    const max = Math.max(...budgets);
    
    let level = 'medium';
    if (average < 1000) level = 'low';
    else if (average > 3000) level = 'high';
    
    return { min, max, average: Math.round(average), level };
  }
  
  /**
   * Analyze trip duration patterns
   */
  analyzeTripDuration(itineraries) {
    const durations = itineraries.map(i => i.days).filter(d => d > 0);
    
    if (durations.length === 0) {
      return { min: 3, max: 7, average: 4, preferred: 4 };
    }
    
    const average = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    // Find most common duration
    const durationCount = {};
    durations.forEach(d => {
      durationCount[d] = (durationCount[d] || 0) + 1;
    });
    const preferred = parseInt(Object.entries(durationCount)
      .sort((a, b) => b[1] - a[1])[0][0]);
    
    return { min, max, average: Math.round(average), preferred };
  }
  
  /**
   * Analyze seasonal preferences
   */
  analyzeSeasonalPreferences(itineraries) {
    const seasonCount = { spring: 0, summer: 0, fall: 0, winter: 0 };
    
    itineraries.forEach(itin => {
      const month = new Date(itin.created_at).getMonth();
      if (month >= 2 && month <= 4) seasonCount.spring++;
      else if (month >= 5 && month <= 7) seasonCount.summer++;
      else if (month >= 8 && month <= 10) seasonCount.fall++;
      else seasonCount.winter++;
    });
    
    return Object.entries(seasonCount)
      .sort((a, b) => b[1] - a[1])
      .map(([season]) => season);
  }
  
  /**
   * Analyze place categories user prefers
   */
  analyzePlaceCategories(itineraries) {
    const categoryCount = {};
    
    itineraries.forEach(itin => {
      if (itin.plan) {
        itin.plan.forEach(day => {
          day.places?.forEach(place => {
            place.category?.forEach(cat => {
              categoryCount[cat] = (categoryCount[cat] || 0) + 1;
            });
          });
        });
      }
    });
    
    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }))
      .slice(0, 10);
  }
  
  /**
   * Get default profile for new users
   */
  getDefaultProfile() {
    return {
      destinations: [],
      interests: ['culture', 'food', 'nature'],
      budgetRange: { min: 500, max: 2000, average: 1000, level: 'medium' },
      tripDuration: { min: 3, max: 7, average: 4, preferred: 4 },
      seasonalPreferences: ['summer', 'spring', 'fall', 'winter'],
      placeCategories: [],
      totalTrips: 0,
      lastTripDate: null
    };
  }
  
  /**
   * Get personalized destination recommendations
   */
  async getDestinationRecommendations(userId, limit = 10) {
    try {
      const profile = await this.analyzeUserProfile(userId);
      
      // Recommendation logic based on user profile
      const recommendations = [];
      
      // NEW USER - Show popular starter destinations
      if (profile.totalTrips === 0) {
        logger.info(`🆕 New user detected - showing starter destinations`);
        const starterDests = this.getStarterDestinations();
        recommendations.push(...starterDests.map(dest => ({
          destination: dest.name,
          reason: dest.reason,
          score: dest.score,
          type: 'starter'
        })));
      } else {
        // EXISTING USER - Personalized recommendations
        
        // 1. Similar destinations to what user has visited (highest priority)
        if (profile.destinations.length > 0) {
          const visitedDests = profile.destinations.map(d => d.destination);
          const similarDests = this.findSimilarDestinations(profile.destinations[0].destination);
          
          // Filter out already visited destinations
          const newSimilarDests = similarDests.filter(dest => !visitedDests.includes(dest));
          
          recommendations.push(...newSimilarDests.map(dest => ({
            destination: dest,
            reason: `Similar to ${profile.destinations[0].destination} which you enjoyed`,
            score: 0.9,
            type: 'similar'
          })));
        }
        
        // 2. Destinations matching user's learned interests
        if (profile.interests.length > 0) {
          const interestBasedDests = this.findDestinationsByInterests(profile.interests);
          const visitedDests = profile.destinations.map(d => d.destination);
          
          // Filter out already visited
          const newInterestDests = interestBasedDests.filter(dest => 
            !visitedDests.includes(dest.name)
          );
          
          recommendations.push(...newInterestDests.map(dest => ({
            destination: dest.name,
            reason: `Matches your interests: ${dest.matchedInterests.join(', ')}`,
            score: 0.85,
            type: 'interest-based'
          })));
        }
        
        // 3. Budget-appropriate destinations
        const budgetDests = this.getTrendingDestinations(profile.budgetRange.level);
        const visitedDests = profile.destinations.map(d => d.destination);
        const newBudgetDests = budgetDests.filter(dest => !visitedDests.includes(dest));
        
        recommendations.push(...newBudgetDests.map(dest => ({
          destination: dest,
          reason: `Fits your ${profile.budgetRange.level} budget (avg $${profile.budgetRange.average})`,
          score: 0.75,
          type: 'budget-match'
        })));
      }
      
      // Remove duplicates and sort by score
      const uniqueRecs = this.removeDuplicateRecommendations(recommendations);
      const sortedRecs = uniqueRecs.sort((a, b) => b.score - a.score).slice(0, limit);
      
      logger.info(`✅ Generated ${sortedRecs.length} personalized recommendations (${profile.totalTrips} trips in history)`);
      
      return {
        recommendations: sortedRecs,
        userProfile: profile
      };
    } catch (error) {
      logger.error(`❌ Failed to get recommendations:`, error);
      return { recommendations: [], userProfile: this.getDefaultProfile() };
    }
  }
  
  /**
   * Get starter destinations for new users
   */
  getStarterDestinations() {
    return [
      { name: 'Kyoto', reason: 'Perfect for culture, food, culture', score: 0.88 },
      { name: 'Rome', reason: 'Perfect for culture, food, nature', score: 0.86 },
      { name: 'Istanbul', reason: 'Trending destination with your medium budget', score: 0.84 },
      { name: 'Tokyo', reason: 'Trending destination with your medium budget', score: 0.82 },
      { name: 'Bangkok', reason: 'Trending destination with your medium budget', score: 0.80 },
      { name: 'Barcelona', reason: 'Trending destination with your medium budget', score: 0.78 },
      { name: 'Iceland', reason: 'Trending destination with your medium budget', score: 0.76 },
      { name: 'New Zealand', reason: 'Trending destination with your medium budget', score: 0.74 },
      { name: 'Switzerland', reason: 'Trending destination with your medium budget', score: 0.72 },
      { name: 'Amsterdam', reason: 'Trending destination with your medium budget', score: 0.70 },
      { name: 'Dublin', reason: 'Trending destination with your medium budget', score: 0.68 },
      { name: 'Vienna', reason: 'Trending destination with your medium budget', score: 0.66 }
    ];
  }
  
  /**
   * Find similar destinations
   */
  findSimilarDestinations(destination) {
    const similarityMap = {
      'Paris': ['London', 'Rome', 'Barcelona', 'Amsterdam'],
      'London': ['Paris', 'Edinburgh', 'Dublin', 'Amsterdam'],
      'Tokyo': ['Seoul', 'Osaka', 'Kyoto', 'Singapore'],
      'New York': ['Chicago', 'Los Angeles', 'San Francisco', 'Boston'],
      'Dubai': ['Abu Dhabi', 'Doha', 'Singapore', 'Hong Kong'],
      'Bali': ['Phuket', 'Maldives', 'Santorini', 'Fiji'],
      'Rome': ['Athens', 'Paris', 'Florence', 'Barcelona'],
      'Barcelona': ['Madrid', 'Lisbon', 'Rome', 'Nice'],
      'Amsterdam': ['Copenhagen', 'Stockholm', 'Brussels', 'Berlin'],
      'Singapore': ['Hong Kong', 'Bangkok', 'Kuala Lumpur', 'Tokyo']
    };
    
    return similarityMap[destination] || ['Paris', 'London', 'Tokyo', 'New York'];
  }
  
  /**
   * Find destinations by interests - with scoring based on match quality
   */
  findDestinationsByInterests(interests) {
    const interestDestMap = {
      'art': [
        { name: 'Paris', matchedInterests: ['art', 'culture'] },
        { name: 'Florence', matchedInterests: ['art', 'history'] },
        { name: 'New York', matchedInterests: ['art', 'culture'] },
        { name: 'Madrid', matchedInterests: ['art', 'culture'] }
      ],
      'culture': [
        { name: 'Kyoto', matchedInterests: ['culture', 'history'] },
        { name: 'Rome', matchedInterests: ['culture', 'history'] },
        { name: 'Istanbul', matchedInterests: ['culture', 'food'] },
        { name: 'Cairo', matchedInterests: ['culture', 'history'] }
      ],
      'food': [
        { name: 'Tokyo', matchedInterests: ['food', 'culture'] },
        { name: 'Bangkok', matchedInterests: ['food', 'adventure'] },
        { name: 'Barcelona', matchedInterests: ['food', 'culture'] },
        { name: 'Lyon', matchedInterests: ['food', 'culture'] }
      ],
      'nature': [
        { name: 'Iceland', matchedInterests: ['nature', 'adventure'] },
        { name: 'New Zealand', matchedInterests: ['nature', 'adventure'] },
        { name: 'Switzerland', matchedInterests: ['nature', 'scenic'] },
        { name: 'Norway', matchedInterests: ['nature', 'scenic'] }
      ],
      'beach': [
        { name: 'Maldives', matchedInterests: ['beach', 'luxury'] },
        { name: 'Bali', matchedInterests: ['beach', 'culture'] },
        { name: 'Santorini', matchedInterests: ['beach', 'romantic'] },
        { name: 'Seychelles', matchedInterests: ['beach', 'nature'] }
      ],
      'adventure': [
        { name: 'Nepal', matchedInterests: ['adventure', 'nature'] },
        { name: 'Costa Rica', matchedInterests: ['adventure', 'nature'] },
        { name: 'Peru', matchedInterests: ['adventure', 'history'] },
        { name: 'Patagonia', matchedInterests: ['adventure', 'nature'] }
      ],
      'history': [
        { name: 'Cairo', matchedInterests: ['history', 'culture'] },
        { name: 'Athens', matchedInterests: ['history', 'culture'] },
        { name: 'Jerusalem', matchedInterests: ['history', 'religious'] },
        { name: 'Petra', matchedInterests: ['history', 'adventure'] }
      ],
      'shopping': [
        { name: 'Dubai', matchedInterests: ['shopping', 'luxury'] },
        { name: 'Milan', matchedInterests: ['shopping', 'fashion'] },
        { name: 'Hong Kong', matchedInterests: ['shopping', 'food'] },
        { name: 'Seoul', matchedInterests: ['shopping', 'culture'] }
      ],
      'museum': [
        { name: 'Paris', matchedInterests: ['museum', 'art'] },
        { name: 'London', matchedInterests: ['museum', 'history'] },
        { name: 'Washington DC', matchedInterests: ['museum', 'history'] }
      ],
      'restaurant': [
        { name: 'Tokyo', matchedInterests: ['restaurant', 'food'] },
        { name: 'Paris', matchedInterests: ['restaurant', 'food'] },
        { name: 'Bangkok', matchedInterests: ['restaurant', 'food'] }
      ],
      'park': [
        { name: 'Vancouver', matchedInterests: ['park', 'nature'] },
        { name: 'Singapore', matchedInterests: ['park', 'culture'] },
        { name: 'Portland', matchedInterests: ['park', 'nature'] }
      ],
      'tourist_attraction': [
        { name: 'Paris', matchedInterests: ['tourist_attraction', 'culture'] },
        { name: 'Rome', matchedInterests: ['tourist_attraction', 'history'] },
        { name: 'Dubai', matchedInterests: ['tourist_attraction', 'modern'] }
      ],
      'church': [
        { name: 'Rome', matchedInterests: ['church', 'history'] },
        { name: 'Barcelona', matchedInterests: ['church', 'architecture'] },
        { name: 'Prague', matchedInterests: ['church', 'history'] }
      ],
      'highly_rated': [
        { name: 'Kyoto', matchedInterests: ['highly_rated', 'culture'] },
        { name: 'Vienna', matchedInterests: ['highly_rated', 'culture'] },
        { name: 'Edinburgh', matchedInterests: ['highly_rated', 'history'] }
      ],
      'popular': [
        { name: 'London', matchedInterests: ['popular', 'culture'] },
        { name: 'New York', matchedInterests: ['popular', 'urban'] },
        { name: 'Barcelona', matchedInterests: ['popular', 'culture'] }
      ]
    };
    
    const destinations = [];
    const destinationScores = new Map();
    
    // Score destinations based on how many interests they match
    interests.forEach(interest => {
      const normalizedInterest = interest.toLowerCase();
      if (interestDestMap[normalizedInterest]) {
        interestDestMap[normalizedInterest].forEach(dest => {
          const currentScore = destinationScores.get(dest.name) || 0;
          destinationScores.set(dest.name, currentScore + 1);
          
          // Only add if not already added
          if (!destinations.find(d => d.name === dest.name)) {
            destinations.push(dest);
          }
        });
      }
    });
    
    // Sort by how many interests matched (destinations that match more interests rank higher)
    return destinations.sort((a, b) => {
      const scoreA = destinationScores.get(a.name) || 0;
      const scoreB = destinationScores.get(b.name) || 0;
      return scoreB - scoreA;
    });
  }
  
  /**
   * Get trending destinations by budget level
   */
  getTrendingDestinations(budgetLevel) {
    const trendingMap = {
      'low': ['Bangkok', 'Lisbon', 'Prague', 'Budapest', 'Krakow'],
      'medium': ['Barcelona', 'Amsterdam', 'Dublin', 'Vienna', 'Copenhagen'],
      'high': ['Dubai', 'Singapore', 'Tokyo', 'Paris', 'London']
    };
    
    return trendingMap[budgetLevel] || trendingMap['medium'];
  }
  
  /**
   * Remove duplicate recommendations
   */
  removeDuplicateRecommendations(recommendations) {
    const seen = new Set();
    return recommendations.filter(rec => {
      if (seen.has(rec.destination)) {
        return false;
      }
      seen.add(rec.destination);
      return true;
    });
  }
  
  /**
   * Get personalized place recommendations for a destination
   */
  async getPlaceRecommendations(userId, destination, places) {
    try {
      const profile = await this.analyzeUserProfile(userId);
      
      // Score each place based on user preferences
      const scoredPlaces = places.map(place => {
        let score = 0.5; // Base score
        
        // Match with user's interests
        const placeCategories = [...(place.category || []), ...(place.tags || [])];
        const matchedInterests = placeCategories.filter(cat => 
          profile.interests.includes(cat.toLowerCase())
        );
        score += matchedInterests.length * 0.1;
        
        // Boost if similar to places user visited before
        if (profile.placeCategories.some(pc => 
          placeCategories.includes(pc.category)
        )) {
          score += 0.2;
        }
        
        // Consider rating
        if (place.rating) {
          score += (place.rating / 5) * 0.2;
        }
        
        return {
          ...place,
          personalizedScore: Math.min(score, 1.0),
          matchedInterests
        };
      });
      
      // Sort by personalized score
      return scoredPlaces.sort((a, b) => b.personalizedScore - a.personalizedScore);
    } catch (error) {
      logger.error(`❌ Failed to score places:`, error);
      return places;
    }
  }
}

module.exports = new UserRecommendationEngine();
