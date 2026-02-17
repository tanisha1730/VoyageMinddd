const logger = require('../utils/logger');

class SmartItineraryGenerator {
  constructor() {
    // Activity templates for different times of day
    this.activityTemplates = {
      arrival: {
        time: '06:00-08:00',
        type: 'logistics',
        activities: [
          'Arrive at {destination} Airport',
          'Take airport transfer to city center',
          'Check into hotel and freshen up',
          'Get oriented with the neighborhood'
        ]
      },
      breakfast: {
        time: '08:00-09:30',
        type: 'food',
        cost: { low: 10, medium: 20, high: 35 }
      },
      morning: {
        time: '09:30-12:30',
        type: 'activity',
        duration: 180
      },
      lunch: {
        time: '12:30-14:00',
        type: 'food',
        cost: { low: 15, medium: 30, high: 50 }
      },
      afternoon: {
        time: '14:00-17:30',
        type: 'activity',
        duration: 210
      },
      evening: {
        time: '18:00-20:00',
        type: 'activity',
        duration: 120
      },
      dinner: {
        time: '20:00-22:00',
        type: 'food',
        cost: { low: 25, medium: 60, high: 150 }
      },
      nightActivity: {
        time: '22:00-23:30',
        type: 'leisure',
        cost: { low: 0, medium: 20, high: 40 }
      }
    };
  }

  // Generate ChatGPT-style itinerary
  generateSmartItinerary(destination, days, budget, interests, places) {
    logger.info(`🎨 Generating smart ChatGPT-style itinerary for ${destination}`);
    
    const budgetLevel = this.determineBudgetLevel(budget, days);
    const dailyBudget = budget / days;
    
    // Ensure we have enough unique places
    const uniquePlaces = this.ensureUniquePlaces(places, days);
    
    const itinerary = [];
    let usedPlaceIds = new Set();
    let totalSpent = 0;
    
    for (let day = 1; day <= days; day++) {
      const isFirstDay = day === 1;
      const isLastDay = day === days;
      
      const dayPlan = this.generateDayPlan(
        day,
        destination,
        dailyBudget,
        budgetLevel,
        interests,
        uniquePlaces,
        usedPlaceIds,
        isFirstDay,
        isLastDay
      );
      
      itinerary.push(dayPlan);
      totalSpent += dayPlan.total_cost;
      
      logger.info(`✅ Day ${day}: ${dayPlan.places.length} activities, $${dayPlan.total_cost} spent`);
    }
    
    logger.info(`💰 Total budget: $${budget}, Spent: $${totalSpent}, Remaining: $${budget - totalSpent}`);
    
    return itinerary;
  }

  // Determine budget level
  determineBudgetLevel(budget, days) {
    const dailyBudget = budget / days;
    if (dailyBudget < 100) return 'low';
    if (dailyBudget < 300) return 'medium';
    return 'high';
  }

  // Ensure we have enough unique places
  ensureUniquePlaces(places, days) {
    const minNeeded = days * 6; // 6 main activities per day
    
    if (places.length >= minNeeded) {
      return places;
    }
    
    // If not enough, we'll reuse but mark them differently
    logger.warn(`⚠️ Only ${places.length} places available, need ${minNeeded}. Will optimize distribution.`);
    return places;
  }

  // Generate a single day plan
  generateDayPlan(day, destination, dailyBudget, budgetLevel, interests, allPlaces, usedPlaceIds, isFirstDay, isLastDay) {
    const theme = this.getDayTheme(day, interests, isFirstDay, isLastDay);
    const activities = [];
    let dayCost = 0;
    
    // Morning
    if (isFirstDay) {
      // Arrival activities
      activities.push({
        place_id: `arrival_${day}`,
        name: `Arrive in ${destination}`,
        start_time: '06:00',
        end_time: '08:00',
        activity_type: 'arrival',
        category: ['logistics'],
        description: `✈️ Arrive at ${destination} Airport. Take airport transfer to city center. Check into your hotel and freshen up. Get oriented with the neighborhood.`,
        entry_fee: 0,
        rating: 0,
        tags: ['arrival', 'logistics'],
        notes: 'Airport transfer: ~$15-30 per person. Hotel check-in usually after 2 PM, but you can store luggage.'
      });
    }
    
    // Breakfast
    const breakfastPlace = this.getNextPlace(allPlaces, usedPlaceIds, ['restaurant', 'cafe', 'food']);
    if (breakfastPlace) {
      const breakfastCost = this.activityTemplates.breakfast.cost[budgetLevel];
      activities.push({
        ...breakfastPlace,
        start_time: isFirstDay ? '08:30' : '08:00',
        end_time: isFirstDay ? '09:30' : '09:00',
        activity_type: 'breakfast',
        description: `☕ Start your day with a delicious breakfast at ${breakfastPlace.name}. ${breakfastPlace.description || 'Enjoy local specialties and fresh coffee.'}`,
        entry_fee: breakfastCost,
        notes: `Breakfast budget: ~$${breakfastCost} per person. ${breakfastPlace.local_tip || 'Try the local breakfast favorites!'}`
      });
      dayCost += breakfastCost;
    }
    
    // Morning Activity
    const morningPlace = this.getNextPlace(allPlaces, usedPlaceIds, ['museum', 'attraction', 'landmark', 'tourist_attraction']);
    if (morningPlace) {
      activities.push({
        ...morningPlace,
        start_time: '10:00',
        end_time: '12:30',
        activity_type: 'morning_main',
        description: `🏛️ ${morningPlace.description || `Visit ${morningPlace.name}, one of ${destination}'s must-see attractions.`} Best visited in the morning when it's less crowded.`,
        notes: `Entry fee: $${morningPlace.entry_fee || 0}. ${morningPlace.local_tip || 'Allow 2-3 hours to fully explore.'}`
      });
      dayCost += morningPlace.entry_fee || 0;
    }
    
    // Lunch
    const lunchPlace = this.getNextPlace(allPlaces, usedPlaceIds, ['restaurant', 'cafe', 'food']);
    if (lunchPlace) {
      const lunchCost = this.activityTemplates.lunch.cost[budgetLevel];
      activities.push({
        ...lunchPlace,
        start_time: '12:30',
        end_time: '14:00',
        activity_type: 'lunch',
        description: `🍽️ Lunch at ${lunchPlace.name}. ${lunchPlace.description || 'Enjoy authentic local cuisine and recharge for the afternoon.'}`,
        entry_fee: lunchCost,
        notes: `Lunch budget: ~$${lunchCost} for 2 people. ${lunchPlace.local_tip || 'Try the chef\'s recommendations!'}`
      });
      dayCost += lunchCost;
    }
    
    // Afternoon Activity 1
    const afternoonPlace1 = this.getNextPlace(allPlaces, usedPlaceIds, ['attraction', 'park', 'landmark', 'shopping']);
    if (afternoonPlace1) {
      activities.push({
        ...afternoonPlace1,
        start_time: '14:30',
        end_time: '16:30',
        activity_type: 'afternoon_main',
        description: `🌆 ${afternoonPlace1.description || `Explore ${afternoonPlace1.name}.`} Perfect afternoon activity with great photo opportunities.`,
        notes: `Entry: $${afternoonPlace1.entry_fee || 0}. ${afternoonPlace1.local_tip || 'Take your time to soak in the atmosphere.'}`
      });
      dayCost += afternoonPlace1.entry_fee || 0;
    }
    
    // Afternoon Activity 2
    const afternoonPlace2 = this.getNextPlace(allPlaces, usedPlaceIds, ['attraction', 'park', 'shopping', 'entertainment']);
    if (afternoonPlace2) {
      activities.push({
        ...afternoonPlace2,
        start_time: '17:00',
        end_time: '18:30',
        activity_type: 'late_afternoon',
        description: `✨ ${afternoonPlace2.description || `Visit ${afternoonPlace2.name}.`} Great for late afternoon exploration.`,
        notes: `Cost: $${afternoonPlace2.entry_fee || 0}. ${afternoonPlace2.local_tip || 'Perfect timing for golden hour photos.'}`
      });
      dayCost += afternoonPlace2.entry_fee || 0;
    }
    
    // Evening Activity
    const eveningPlace = this.getNextPlace(allPlaces, usedPlaceIds, ['attraction', 'entertainment', 'viewpoint']);
    if (eveningPlace) {
      activities.push({
        ...eveningPlace,
        start_time: '19:00',
        end_time: '20:00',
        activity_type: 'early_evening',
        description: `🌙 ${eveningPlace.description || `Experience ${eveningPlace.name} in the evening.`} Beautiful evening atmosphere and lighting.`,
        notes: `Entry: $${eveningPlace.entry_fee || 0}. ${eveningPlace.local_tip || 'Evening is the best time to visit for a magical experience.'}`
      });
      dayCost += eveningPlace.entry_fee || 0;
    }
    
    // Dinner
    const dinnerPlace = this.getNextPlace(allPlaces, usedPlaceIds, ['restaurant', 'fine_dining', 'food']);
    if (dinnerPlace) {
      const dinnerCost = this.activityTemplates.dinner.cost[budgetLevel];
      activities.push({
        ...dinnerPlace,
        start_time: '20:30',
        end_time: '22:00',
        activity_type: 'dinner',
        description: `🍷 Fine dining at ${dinnerPlace.name}. ${dinnerPlace.description || 'Enjoy an exquisite dinner with local specialties and wine.'}`,
        entry_fee: dinnerCost,
        notes: `Dinner budget: ~$${dinnerCost} for 2 people (2-course + wine). ${dinnerPlace.local_tip || 'Reservations recommended!'}`
      });
      dayCost += dinnerCost;
    }
    
    // Night Activity (optional, not on last day)
    if (!isLastDay && budgetLevel !== 'low') {
      const nightCost = this.activityTemplates.nightActivity.cost[budgetLevel];
      activities.push({
        place_id: `night_${day}`,
        name: `Evening Stroll & Nightlife`,
        start_time: '22:30',
        end_time: '23:30',
        activity_type: 'night_leisure',
        category: ['leisure'],
        description: `🌃 Take a romantic evening walk through ${destination}'s illuminated streets. Enjoy the nightlife or simply relax at a cozy bar.`,
        entry_fee: nightCost,
        rating: 4.5,
        tags: ['nightlife', 'leisure', 'romantic'],
        notes: `Optional activity. Budget: ~$${nightCost} for drinks/entertainment.`
      });
      dayCost += nightCost;
    }
    
    // Last day departure
    if (isLastDay) {
      activities.push({
        place_id: `departure_${day}`,
        name: 'Departure Preparation',
        start_time: '22:00',
        end_time: '23:00',
        activity_type: 'departure',
        category: ['logistics'],
        description: `✈️ Pack your belongings and prepare for departure. Reflect on the wonderful memories you've made in ${destination}. Check flight times and set alarms.`,
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
      total_cost: Math.round(dayCost),
      budget_remaining: Math.round(dailyBudget - dayCost),
      summary: `Day ${day} focuses on ${theme.description.toLowerCase()}. You'll experience ${activities.filter(a => !['breakfast', 'lunch', 'dinner', 'arrival', 'departure'].includes(a.activity_type)).length} main attractions with carefully planned meals and optimal timing for each location.`
    };
  }

  // Get next unique place
  getNextPlace(allPlaces, usedPlaceIds, preferredCategories = []) {
    // First try to find unused place with preferred category
    for (const place of allPlaces) {
      if (!usedPlaceIds.has(place.place_id)) {
        const hasPreferredCategory = preferredCategories.length === 0 || 
          preferredCategories.some(cat => 
            place.category?.some(c => c.toLowerCase().includes(cat.toLowerCase()))
          );
        
        if (hasPreferredCategory) {
          usedPlaceIds.add(place.place_id);
          return place;
        }
      }
    }
    
    // If no preferred category found, get any unused place
    for (const place of allPlaces) {
      if (!usedPlaceIds.has(place.place_id)) {
        usedPlaceIds.add(place.place_id);
        return place;
      }
    }
    
    // If all places used, return null (shouldn't happen if we have enough places)
    return null;
  }

  // Get day theme
  getDayTheme(day, interests, isFirstDay, isLastDay) {
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
      { name: 'Elegance & Fine Dining', description: 'Luxury experiences with affordable indulgence', emoji: '✨' },
      { name: 'Local Life & Authentic Experiences', description: 'Living like a local', emoji: '🌟' },
      { name: 'Nature & Adventure', description: 'Outdoor exploration and scenic beauty', emoji: '🌿' },
      { name: 'History & Heritage', description: 'Ancient stories and cultural treasures', emoji: '🏛️' }
    ];
    
    return themes[(day - 2) % themes.length];
  }
}

module.exports = new SmartItineraryGenerator();
