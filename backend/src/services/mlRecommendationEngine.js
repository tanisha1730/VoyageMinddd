// Using simple ML algorithms without TensorFlow for Windows compatibility
const logger = require('../utils/logger');

class MLRecommendationEngine {
  constructor() {
    this.model = null;
    this.isTraining = false;
    this.trainingData = [];
    this.userPreferences = new Map();
    this.placeFeatures = new Map();
  }

  // Extract features from place data for ML model
  extractPlaceFeatures(place) {
    const features = {
      // Numerical features
      rating: place.rating || 0,
      user_ratings_total: Math.log(place.user_ratings_total + 1) / 10, // Normalize
      entry_fee: Math.min(place.entry_fee / 100, 1), // Normalize to 0-1
      
      // Category features (one-hot encoding)
      is_museum: place.category.includes('museum') ? 1 : 0,
      is_restaurant: place.category.includes('restaurant') ? 1 : 0,
      is_park: place.category.includes('park') ? 1 : 0,
      is_tourist_attraction: place.category.includes('tourist_attraction') ? 1 : 0,
      is_church: place.category.includes('church') ? 1 : 0,
      is_shopping: place.category.includes('shopping') ? 1 : 0,
      is_entertainment: place.category.includes('entertainment') ? 1 : 0,
      
      // Tag features
      is_highly_rated: place.tags.includes('highly_rated') ? 1 : 0,
      is_popular: place.tags.includes('popular') ? 1 : 0,
      is_free: place.entry_fee === 0 ? 1 : 0,
      is_expensive: place.entry_fee > 50 ? 1 : 0,
      
      // Time features
      is_open_weekends: this.isOpenWeekends(place.opening_hours) ? 1 : 0,
      is_open_evenings: this.isOpenEvenings(place.opening_hours) ? 1 : 0
    };

    return Object.values(features);
  }

  // Extract user preference features
  extractUserFeatures(user, preferences) {
    const features = {
      // Budget preference
      budget_low: preferences.budget === 'low' ? 1 : 0,
      budget_medium: preferences.budget === 'medium' ? 1 : 0,
      budget_high: preferences.budget === 'high' ? 1 : 0,
      
      // Interest features
      likes_art: preferences.interests.includes('art') ? 1 : 0,
      likes_culture: preferences.interests.includes('culture') ? 1 : 0,
      likes_history: preferences.interests.includes('history') ? 1 : 0,
      likes_food: preferences.interests.includes('food') ? 1 : 0,
      likes_nature: preferences.interests.includes('nature') ? 1 : 0,
      likes_entertainment: preferences.interests.includes('entertainment') ? 1 : 0,
      likes_shopping: preferences.interests.includes('shopping') ? 1 : 0,
      likes_architecture: preferences.interests.includes('architecture') ? 1 : 0,
      
      // Derived features
      interest_count: preferences.interests.length / 10, // Normalize
      is_cultural_tourist: (preferences.interests.includes('art') || 
                           preferences.interests.includes('culture') || 
                           preferences.interests.includes('history')) ? 1 : 0
    };

    return Object.values(features);
  }

  // Create training data from user interactions
  addTrainingData(userId, place, rating, preferences) {
    const userFeatures = this.extractUserFeatures({ _id: userId }, preferences);
    const placeFeatures = this.extractPlaceFeatures(place);
    
    this.trainingData.push({
      input: [...userFeatures, ...placeFeatures],
      output: [rating / 5.0] // Normalize rating to 0-1
    });

    // Store for future use
    this.userPreferences.set(userId, preferences);
    this.placeFeatures.set(place.place_id, placeFeatures);
  }

  // Build and train a simple ML model using collaborative filtering
  async buildAndTrainModel() {
    if (this.isTraining || this.trainingData.length < 5) {
      return false; // Need at least 5 training examples
    }

    this.isTraining = true;
    logger.info('Starting ML model training...');

    try {
      // Simple collaborative filtering approach
      this.model = {
        weights: this.calculateFeatureWeights(),
        userSimilarity: this.calculateUserSimilarity(),
        itemSimilarity: this.calculateItemSimilarity(),
        trained: true
      };

      logger.info('ML model training completed successfully');
      return true;
    } catch (error) {
      logger.error('ML model training failed:', error);
      return false;
    } finally {
      this.isTraining = false;
    }
  }

  calculateFeatureWeights() {
    const weights = {};
    const featureNames = [
      'rating', 'user_ratings_total', 'entry_fee', 'is_museum', 'is_restaurant', 
      'is_park', 'is_tourist_attraction', 'is_highly_rated', 'is_popular', 'is_free'
    ];

    // Calculate correlation between features and ratings
    featureNames.forEach((feature, index) => {
      let correlation = 0;
      let count = 0;

      this.trainingData.forEach(data => {
        const featureValue = data.input[index + 11]; // Skip user features
        const rating = data.output[0];
        correlation += featureValue * rating;
        count++;
      });

      weights[feature] = count > 0 ? correlation / count : 0.5;
    });

    return weights;
  }

  calculateUserSimilarity() {
    // Simple user similarity based on preferences
    const similarity = new Map();
    
    this.trainingData.forEach((data1, i) => {
      this.trainingData.forEach((data2, j) => {
        if (i !== j) {
          const userFeatures1 = data1.input.slice(0, 11);
          const userFeatures2 = data2.input.slice(0, 11);
          
          const sim = this.cosineSimilarity(userFeatures1, userFeatures2);
          similarity.set(`${i}_${j}`, sim);
        }
      });
    });

    return similarity;
  }

  calculateItemSimilarity() {
    // Simple item similarity based on features
    const similarity = new Map();
    
    this.trainingData.forEach((data1, i) => {
      this.trainingData.forEach((data2, j) => {
        if (i !== j) {
          const itemFeatures1 = data1.input.slice(11);
          const itemFeatures2 = data2.input.slice(11);
          
          const sim = this.cosineSimilarity(itemFeatures1, itemFeatures2);
          similarity.set(`${i}_${j}`, sim);
        }
      });
    });

    return similarity;
  }

  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // Get ML-powered recommendations
  async getRecommendations(userId, preferences, places) {
    if (!this.model || !this.model.trained || places.length === 0) {
      return this.getFallbackRecommendations(places, preferences);
    }

    try {
      const userFeatures = this.extractUserFeatures({ _id: userId }, preferences);
      const recommendations = [];

      for (const place of places) {
        const placeFeatures = this.extractPlaceFeatures(place);
        const score = this.predictScore(userFeatures, placeFeatures);
        
        recommendations.push({
          place_id: place.place_id,
          score: score,
          confidence: this.calculateConfidence(place, preferences),
          reasons: this.generateRecommendationReasons(place, preferences)
        });
      }

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(20, places.length));

    } catch (error) {
      logger.error('ML recommendation failed:', error);
      return this.getFallbackRecommendations(places, preferences);
    }
  }

  predictScore(userFeatures, placeFeatures) {
    let score = 0.5; // Base score

    // Use trained weights
    const weights = this.model.weights;
    const featureNames = Object.keys(weights);

    featureNames.forEach((feature, index) => {
      if (index < placeFeatures.length) {
        score += placeFeatures[index] * (weights[feature] || 0.5);
      }
    });

    // User preference matching
    const userInterestScore = this.calculateUserInterestMatch(userFeatures, placeFeatures);
    score += userInterestScore * 0.3;

    return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
  }

  calculateUserInterestMatch(userFeatures, placeFeatures) {
    // Simple dot product of user interests and place categories
    let match = 0;
    const userInterests = userFeatures.slice(3, 11); // Interest features
    const placeCategories = placeFeatures.slice(3, 10); // Category features

    for (let i = 0; i < Math.min(userInterests.length, placeCategories.length); i++) {
      match += userInterests[i] * placeCategories[i];
    }

    return match / Math.max(userInterests.length, 1);
  }

  // Fallback recommendation system
  getFallbackRecommendations(places, preferences) {
    return places.map(place => {
      let score = 0.5; // Base score

      // Rating boost
      score += (place.rating / 5) * 0.3;

      // Interest matching
      const interests = preferences.interests || [];
      interests.forEach(interest => {
        if (this.placeMatchesInterest(place, interest)) {
          score += 0.2;
        }
      });

      // Budget consideration
      if (preferences.budget === 'low' && place.entry_fee === 0) score += 0.1;
      if (preferences.budget === 'high' && place.entry_fee > 30) score += 0.1;

      // Popularity boost
      if (place.tags.includes('popular')) score += 0.1;
      if (place.tags.includes('highly_rated')) score += 0.1;

      return {
        place_id: place.place_id,
        score: Math.min(score, 1.0),
        confidence: 0.7,
        reasons: this.generateRecommendationReasons(place, preferences)
      };
    }).sort((a, b) => b.score - a.score);
  }

  placeMatchesInterest(place, interest) {
    const interestMapping = {
      'art': ['museum', 'art_gallery'],
      'culture': ['museum', 'cultural_center', 'church'],
      'history': ['museum', 'historical_site', 'church'],
      'food': ['restaurant'],
      'nature': ['park'],
      'entertainment': ['entertainment', 'nightclub'],
      'shopping': ['shopping'],
      'architecture': ['church', 'mosque', 'temple']
    };

    const relevantCategories = interestMapping[interest] || [];
    return relevantCategories.some(cat => place.category.includes(cat));
  }

  generateRecommendationReasons(place, preferences) {
    const reasons = [];

    if (place.rating >= 4.5) reasons.push('Highly rated by visitors');
    if (place.entry_fee === 0) reasons.push('Free admission');
    if (place.tags.includes('popular')) reasons.push('Popular attraction');

    preferences.interests.forEach(interest => {
      if (this.placeMatchesInterest(place, interest)) {
        reasons.push(`Perfect for ${interest} lovers`);
      }
    });

    return reasons.slice(0, 3); // Limit to 3 reasons
  }

  calculateConfidence(place, preferences) {
    let confidence = 0.5;
    
    if (place.rating > 0) confidence += 0.2;
    if (place.user_ratings_total > 100) confidence += 0.1;
    if (preferences.interests.some(interest => this.placeMatchesInterest(place, interest))) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  isOpenWeekends(openingHours) {
    return openingHours && (openingHours.saturday || openingHours.sunday);
  }

  isOpenEvenings(openingHours) {
    if (!openingHours) return false;
    
    const days = Object.values(openingHours);
    return days.some(day => {
      if (day.close) {
        const closeHour = parseInt(day.close.substring(0, 2));
        return closeHour >= 20; // Open until 8 PM or later
      }
      return false;
    });
  }

  // Simulate user feedback for training
  simulateUserFeedback(userId, place, preferences) {
    // This would normally come from user interactions
    // For now, simulate based on preference matching
    let rating = 3.0; // Base rating

    if (preferences.interests.some(interest => this.placeMatchesInterest(place, interest))) {
      rating += 1.0;
    }

    if (place.rating >= 4.0) rating += 0.5;
    if (preferences.budget === 'low' && place.entry_fee === 0) rating += 0.5;
    if (preferences.budget === 'high' && place.entry_fee > 30) rating += 0.3;

    rating = Math.min(rating, 5.0);
    this.addTrainingData(userId, place, rating, preferences);
  }
}

module.exports = new MLRecommendationEngine();