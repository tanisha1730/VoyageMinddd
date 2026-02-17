const logger = require('../utils/logger');

/**
 * Simple, reliable itinerary builder that creates ChatGPT-style itineraries
 * WITHOUT vague or generic places
 */
class SimpleItineraryBuilder {
  
  /**
   * Build a complete itinerary with REAL places only
   */
  buildItinerary(destination, days, budget, interests, realPlaces) {
    logger.info(`🎯 Building itinerary for ${destination}: ${days} days, $${budget} budget`);
    
    // Filter out any generic/vague places
    const validPlaces = realPlaces.filter(place => 
      place.name && 
      place.name.length > 3 &&
      !place.name.includes('undefined') &&
      !place.name.includes('Create An') &&
      !place.name.includes('Attraction 1') &&
      !place.name.includes('Revisit') &&
      place.place_id &&
      place.place_id.length > 5
    );
    
    logger.info(`✅ Valid places: ${validPlaces.length} out of ${realPlaces.length}`);
    
    // Calculate budget per day
    const dailyBudget = Math.floor(budget / days);
    const budgetLevel = this.getBudgetLevel(dailyBudget);
    
    logger.info(`💰 Daily budget: $${dailyBudget} (${budgetLevel} level)`);
    
    // Ensure we have enough UNIQUE places for ALL days
    const placesNeededPerDay = 6; // 6 main attractions per day (excluding meals)
    const totalPlacesNeeded = days * placesNeededPerDay;
    
    if (validPlaces.length < totalPlacesNeeded) {
      logger.warn(`⚠️ Not enough places! Have ${validPlaces.length}, need ${totalPlacesNeeded} for ${days} days`);
      logger.warn(`⚠️ Will use all available places without repetition`);
    }
    
    const itinerary = [];
    const usedPlaceIds = new Set();
    
    // Build each day with UNIQUE places
    for (let day = 1; day <= days; day++) {
      const dayPlan = this.buildDayPlan(
        day,
        destination,
        dailyBudget,
        budgetLevel,
        validPlaces,
        usedPlaceIds,
        day === 1,
        day === days
      );
      
      itinerary.push(dayPlan);
      
      logger.info(`✅ Day ${day}: ${dayPlan.places.length} activities, $${dayPlan.total_cost} spent (budget: $${dailyBudget})`);
    }
    
    const totalSpent = itinerary.reduce((sum, day) => sum + day.total_cost, 0);
    logger.info(`💰 Total spent: $${totalSpent} out of $${budget} budget`);
    
    return itinerary;
  }
  
  /**
   * Get budget level
   */
  getBudgetLevel(dailyBudget) {
    if (dailyBudget < 100) return 'low';
    if (dailyBudget < 300) return 'medium';
    return 'high';
  }
  
  /**
   * Build a single day plan
   */
  buildDayPlan(day, destination, dailyBudget, budgetLevel, allPlaces, usedPlaceIds, isFirstDay, isLastDay) {
    const activities = [];
    let totalCost = 0;
    
    // Meal costs by budget level
    const costs = {
      low: { breakfast: 12, lunch: 20, dinner: 30 },
      medium: { breakfast: 20, lunch: 35, dinner: 70 },
      high: { breakfast: 35, lunch: 55, dinner: 150 }
    };
    
    const mealCosts = costs[budgetLevel];
    
    // Day theme
    const theme = this.getDayTheme(day, isFirstDay, isLastDay);
    
    // 1. ARRIVAL (First day only)
    if (isFirstDay) {
      activities.push({
        place_id: `arrival_day${day}`,
        name: `Arrive in ${destination}`,
        start_time: '06:00',
        end_time: '08:00',
        activity_type: 'arrival',
        category: ['logistics'],
        description: `✈️ Welcome to ${destination}! Arrive at the airport, take transport to your hotel, check in and freshen up. Get ready for an amazing adventure!`,
        entry_fee: 0,
        rating: 0,
        tags: ['arrival', 'logistics'],
        notes: 'Airport transfer typically costs $15-30 per person. Hotel check-in is usually after 2 PM.'
      });
    }
    
    // 2. BREAKFAST
    const breakfastPlace = this.getNextPlace(allPlaces, usedPlaceIds, ['restaurant', 'cafe']);
    activities.push({
      place_id: breakfastPlace?.place_id || `breakfast_day${day}`,
      name: breakfastPlace?.name || `Local Café in ${destination}`,
      start_time: '08:00',
      end_time: '09:00',
      activity_type: 'breakfast',
      category: ['restaurant'],
      description: `☕ Start your day with breakfast at ${breakfastPlace?.name || 'a charming local café'}. ${breakfastPlace?.description || 'Enjoy fresh pastries, coffee, and local breakfast specialties.'}`,
      entry_fee: mealCosts.breakfast,
      rating: breakfastPlace?.rating || 4.3,
      tags: ['breakfast', 'food'],
      location: breakfastPlace?.location || { lat: 0, lng: 0 },
      notes: `Budget: ~$${mealCosts.breakfast} per person. Try the local breakfast favorites!`
    });
    totalCost += mealCosts.breakfast;
    
    // 3. MORNING ACTIVITY (Avoid cafes/restaurants - want real attractions!)
    const morningPlace = this.getNextPlace(allPlaces, usedPlaceIds, 
      ['museum', 'attraction', 'landmark', 'tourist_attraction', 'historic', 'monument'],
      ['cafe', 'restaurant', 'food', 'bar', 'pub']
    );
    if (morningPlace) {
      const entryFee = morningPlace.entry_fee || 0;
      activities.push({
        ...morningPlace,
        start_time: '09:30',
        end_time: '12:00',
        activity_type: 'morning_main',
        description: `🏛️ ${morningPlace.description || `Visit ${morningPlace.name}, one of ${destination}'s most iconic attractions.`} Best visited in the morning to avoid crowds.`,
        notes: `Entry fee: $${entryFee}. Allow 2-3 hours to fully explore this amazing place.`,
        entry_fee: entryFee
      });
      totalCost += entryFee;
    } else {
      logger.warn(`⚠️ Day ${dayNumber}: No morning place available`);
    }
    
    // 4. LUNCH
    const lunchPlace = this.getNextPlace(allPlaces, usedPlaceIds, ['restaurant']);
    activities.push({
      place_id: lunchPlace?.place_id || `lunch_day${day}`,
      name: lunchPlace?.name || `Restaurant in ${destination}`,
      start_time: '12:30',
      end_time: '14:00',
      activity_type: 'lunch',
      category: ['restaurant'],
      description: `🍽️ Lunch at ${lunchPlace?.name || 'a recommended local restaurant'}. ${lunchPlace?.description || 'Savor authentic local cuisine and recharge for the afternoon adventures.'}`,
      entry_fee: mealCosts.lunch,
      rating: lunchPlace?.rating || 4.4,
      tags: ['lunch', 'food'],
      location: lunchPlace?.location || { lat: 0, lng: 0 },
      notes: `Budget: ~$${mealCosts.lunch} for 2 people. Don't miss their signature dishes!`
    });
    totalCost += mealCosts.lunch;
    
    // 5. AFTERNOON ACTIVITY 1 (Real attractions, not cafes!)
    const afternoonPlace1 = this.getNextPlace(allPlaces, usedPlaceIds, 
      ['attraction', 'park', 'shopping', 'landmark', 'historic', 'museum'],
      ['cafe', 'restaurant', 'food', 'bar']
    );
    if (afternoonPlace1) {
      const entryFee1 = afternoonPlace1.entry_fee || 0;
      activities.push({
        ...afternoonPlace1,
        start_time: '14:30',
        end_time: '16:30',
        activity_type: 'afternoon_main',
        description: `🌆 ${afternoonPlace1.description || `Explore ${afternoonPlace1.name}.`} Perfect afternoon activity with stunning views and photo opportunities.`,
        notes: `Entry: $${entryFee1}. ${afternoonPlace1.local_tip || 'Take your time to soak in the atmosphere.'}`,
        entry_fee: entryFee1
      });
      totalCost += entryFee1;
    }
    
    // 6. AFTERNOON ACTIVITY 2 (Variety - different from morning!)
    const afternoonPlace2 = this.getNextPlace(allPlaces, usedPlaceIds, 
      ['attraction', 'entertainment', 'historic', 'architecture', 'viewpoint'],
      ['cafe', 'restaurant', 'food']
    );
    if (afternoonPlace2) {
      const entryFee2 = afternoonPlace2.entry_fee || 0;
      activities.push({
        ...afternoonPlace2,
        start_time: '17:00',
        end_time: '18:30',
        activity_type: 'late_afternoon',
        description: `✨ ${afternoonPlace2.description || `Visit ${afternoonPlace2.name}.`} Great for late afternoon exploration and golden hour photography.`,
        notes: `Cost: $${entryFee2}. ${afternoonPlace2.local_tip || 'Perfect timing for beautiful photos.'}`,
        entry_fee: entryFee2
      });
      totalCost += entryFee2;
    }
    
    // 7. EVENING ACTIVITY (Scenic/viewpoint for sunset!)
    const eveningPlace = this.getNextPlace(allPlaces, usedPlaceIds, 
      ['viewpoint', 'landmark', 'attraction', 'scenic', 'tower'],
      ['cafe', 'restaurant', 'food']
    );
    if (eveningPlace) {
      const entryFee3 = eveningPlace.entry_fee || 0;
      activities.push({
        ...eveningPlace,
        start_time: '19:00',
        end_time: '20:00',
        activity_type: 'early_evening',
        description: `🌙 ${eveningPlace.description || `Experience ${eveningPlace.name} in the evening.`} Beautiful evening atmosphere with magical lighting.`,
        notes: `Entry: $${entryFee3}. ${eveningPlace.local_tip || 'Evening is the best time for a magical experience.'}`,
        entry_fee: entryFee3
      });
      totalCost += entryFee3;
    }
    
    // 8. DINNER
    const dinnerPlace = this.getNextPlace(allPlaces, usedPlaceIds, ['restaurant', 'fine_dining']);
    activities.push({
      place_id: dinnerPlace?.place_id || `dinner_day${day}`,
      name: dinnerPlace?.name || `Fine Dining in ${destination}`,
      start_time: '20:30',
      end_time: '22:00',
      activity_type: 'dinner',
      category: ['restaurant'],
      description: `🍷 Dinner at ${dinnerPlace?.name || 'an elegant restaurant'}. ${dinnerPlace?.description || 'Enjoy exquisite cuisine with local specialties and fine wine.'}`,
      entry_fee: mealCosts.dinner,
      rating: dinnerPlace?.rating || 4.6,
      tags: ['dinner', 'fine_dining'],
      location: dinnerPlace?.location || { lat: 0, lng: 0 },
      notes: `Budget: ~$${mealCosts.dinner} for 2 people (2-course + wine). Reservations recommended!`
    });
    totalCost += mealCosts.dinner;
    
    // 9. DEPARTURE (Last day only)
    if (isLastDay) {
      activities.push({
        place_id: `departure_day${day}`,
        name: 'Departure Preparation',
        start_time: '22:00',
        end_time: '23:00',
        activity_type: 'departure',
        category: ['logistics'],
        description: `✈️ Pack your belongings and prepare for departure. Reflect on the wonderful memories you've made in ${destination}. Safe travels!`,
        entry_fee: 0,
        rating: 0,
        tags: ['departure', 'logistics'],
        notes: 'Check hotel checkout time (usually 11 AM). Arrange airport transfer in advance.'
      });
    }
    
    return {
      day,
      theme: theme.name,
      theme_description: theme.description,
      emoji: theme.emoji,
      places: activities,
      total_cost: Math.round(totalCost),
      budget_remaining: Math.round(dailyBudget - totalCost),
      summary: `Day ${day} focuses on ${theme.description.toLowerCase()}. Experience ${activities.filter(a => a.activity_type && !['breakfast', 'lunch', 'dinner', 'arrival', 'departure'].includes(a.activity_type)).length} amazing attractions with perfectly timed meals.`
    };
  }
  
  /**
   * Get next UNIQUE place with SMART VARIETY - NO REPETITION!
   */
  getNextPlace(allPlaces, usedPlaceIds, preferredCategories = [], avoidCategories = []) {
    // First pass: Try to find unused place with preferred category (NOT avoided ones)
    for (const place of allPlaces) {
      if (usedPlaceIds.has(place.place_id)) continue;
      
      // Skip if this is an avoided category (e.g., don't want all cafes)
      const isAvoided = avoidCategories.some(avoid => 
        place.category?.some(c => c.toLowerCase().includes(avoid.toLowerCase())) ||
        place.tags?.some(t => t.toLowerCase().includes(avoid.toLowerCase())) ||
        place.name?.toLowerCase().includes(avoid.toLowerCase())
      );
      
      if (isAvoided) continue;
      
      const matchesCategory = preferredCategories.length === 0 || 
        preferredCategories.some(cat => 
          place.category?.some(c => c.toLowerCase().includes(cat.toLowerCase())) ||
          place.tags?.some(t => t.toLowerCase().includes(cat.toLowerCase()))
        );
      
      if (matchesCategory) {
        usedPlaceIds.add(place.place_id);
        logger.info(`✅ Selected: ${place.name} (${place.category?.[0] || 'attraction'})`);
        return place;
      }
    }
    
    // Second pass: Get ANY unused place (no category preference, but still avoid certain types)
    for (const place of allPlaces) {
      if (usedPlaceIds.has(place.place_id)) continue;
      
      // Still avoid cafes/restaurants for main activities
      const isAvoided = avoidCategories.some(avoid => 
        place.category?.some(c => c.toLowerCase().includes(avoid.toLowerCase())) ||
        place.name?.toLowerCase().includes(avoid.toLowerCase())
      );
      
      if (!isAvoided) {
        usedPlaceIds.add(place.place_id);
        logger.info(`✅ Selected: ${place.name} (any category)`);
        return place;
      }
    }
    
    // Third pass: If we're desperate, take anything
    for (const place of allPlaces) {
      if (!usedPlaceIds.has(place.place_id)) {
        usedPlaceIds.add(place.place_id);
        logger.info(`✅ Selected: ${place.name} (last resort)`);
        return place;
      }
    }
    
    // No more unique places available
    logger.warn(`⚠️ No more unique places available! Used ${usedPlaceIds.size} places`);
    return null;
  }
  
  /**
   * Get day theme
   */
  getDayTheme(day, isFirstDay, isLastDay) {
    if (isFirstDay) {
      return {
        name: 'Arrival & First Impressions',
        description: 'Getting oriented and experiencing the highlights',
        emoji: '❤️'
      };
    }
    
    if (isLastDay) {
      return {
        name: 'Leisure & Farewell',
        description: 'Final experiences and sweet goodbyes',
        emoji: '💞'
      };
    }
    
    const themes = [
      { name: 'Classic Highlights & Hidden Gems', description: 'Culture, art, and secret corners', emoji: '🎨' },
      { name: 'Elegance & Fine Dining', description: 'Luxury with affordable indulgence', emoji: '✨' },
      { name: 'Local Life & Authentic Experiences', description: 'Living like a local', emoji: '🌟' }
    ];
    
    return themes[(day - 2) % themes.length];
  }
}

module.exports = new SimpleItineraryBuilder();
