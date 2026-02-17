const logger = require('../utils/logger');

class ComprehensiveItineraryGenerator {
  constructor() {
    this.timeSlots = {
      morning: { start: 6, end: 12 },
      afternoon: { start: 12, end: 18 },
      evening: { start: 18, end: 23 }
    };
  }

  // Generate comprehensive day-by-day itinerary like ChatGPT
  generateDetailedItinerary(destination, days, budget, interests, places) {
    logger.info(`🎨 Generating comprehensive itinerary for ${destination}`);
    
    const plan = [];
    const themes = this.generateDayThemes(destination, days, interests);
    const budgetPerDay = budget / days;
    
    for (let day = 1; day <= days; day++) {
      const dayPlan = this.generateDetailedDay(
        day,
        destination,
        themes[day - 1],
        budgetPerDay,
        interests,
        places,
        day === 1, // isFirstDay
        day === days // isLastDay
      );
      
      plan.push(dayPlan);
    }
    
    return plan;
  }

  // Generate themes for each day
  generateDayThemes(destination, days, interests) {
    const themeTemplates = {
      1: { name: 'Arrival & Exploration', focus: 'Getting oriented and seeing highlights' },
      2: { name: 'Culture & Heritage', focus: 'Museums, historic sites, and local culture' },
      3: { name: 'Nature & Adventure', focus: 'Outdoor activities and scenic spots' },
      4: { name: 'Local Life & Hidden Gems', focus: 'Authentic experiences and local favorites' },
      5: { name: 'Relaxation & Departure', focus: 'Leisure activities and final experiences' }
    };

    const themes = [];
    for (let i = 0; i < days; i++) {
      const dayNum = (i % 5) + 1;
      themes.push(themeTemplates[dayNum]);
    }
    
    return themes;
  }

  // Generate detailed day plan with ChatGPT-style comprehensive descriptions
  generateDetailedDay(dayNumber, destination, theme, budgetPerDay, interests, allPlaces, isFirstDay, isLastDay) {
    const dayPlaces = this.selectPlacesForDay(allPlaces, dayNumber, interests, 8);
    
    logger.info(`📅 Day ${dayNumber}: Selected ${dayPlaces.length} unique places`);
    
    // Create comprehensive schedule with proper timing
    const schedule = [];
    let currentCost = 0;
    let placeIndex = 0;

    // Helper to format time
    const formatTime = (hour, minute = 0) => {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    // Helper to create detailed activity description
    const createActivityDescription = (place, timeOfDay) => {
      let description = place.description || `Explore ${place.name}`;
      
      if (place.place_type === 'hidden_gem') {
        description += ` 💎 This hidden gem offers an authentic local experience away from tourist crowds.`;
      }
      
      if (place.local_tip) {
        description += ` Local tip: ${place.local_tip}`;
      }
      
      if (timeOfDay === 'morning') {
        description += ` Best visited in the morning when it's less crowded.`;
      } else if (timeOfDay === 'evening') {
        description += ` Perfect for evening visits with beautiful lighting.`;
      }
      
      return description;
    };

    // MORNING (8:00 AM - 12:00 PM)
    if (isFirstDay) {
      schedule.push({
        place_id: `arrival_${dayNumber}`,
        name: `Arrival in ${destination}`,
        start_time: formatTime(6, 0),
        end_time: formatTime(8, 0),
        category: ['logistics'],
        activity_type: 'arrival',
        description: `Welcome to ${destination}! Check into your accommodation and freshen up. Take some time to settle in and prepare for your adventure.`,
        entry_fee: 0,
        tags: ['logistics', 'arrival'],
        rating: 0
      });
    }

    // Breakfast (8:00 - 9:00 AM)
    const breakfastPlace = dayPlaces[placeIndex++];
    if (breakfastPlace) {
      schedule.push({
        ...breakfastPlace,
        start_time: formatTime(8, 0),
        end_time: formatTime(9, 0),
        activity_type: 'breakfast',
        description: `Start your day with a delicious breakfast at ${breakfastPlace.name}. ${breakfastPlace.description || 'Enjoy local specialties and fresh coffee.'}`,
        notes: `Recommended breakfast spot. ${breakfastPlace.local_tip || 'Try the local favorites!'}`
      });
      currentCost += breakfastPlace.entry_fee || 15;
    }

    // Morning Activity 1 (9:30 AM - 11:30 AM)
    const morningPlace1 = dayPlaces[placeIndex++];
    if (morningPlace1) {
      schedule.push({
        ...morningPlace1,
        start_time: formatTime(9, 30),
        end_time: formatTime(11, 30),
        activity_type: 'morning_main',
        description: createActivityDescription(morningPlace1, 'morning'),
        notes: `${theme.focus}. ${morningPlace1.ml_reasons?.join('. ') || 'Highly recommended based on your interests.'}`
      });
      currentCost += morningPlace1.entry_fee || 0;
    }

    // AFTERNOON (12:00 PM - 6:00 PM)
    
    // Lunch (12:00 PM - 1:30 PM)
    const lunchPlace = dayPlaces[placeIndex++];
    if (lunchPlace) {
      schedule.push({
        ...lunchPlace,
        start_time: formatTime(12, 0),
        end_time: formatTime(13, 30),
        activity_type: 'lunch',
        description: `Lunch break at ${lunchPlace.name}. ${lunchPlace.description || 'Savor authentic local cuisine and recharge for the afternoon.'}`,
        notes: `Perfect spot for lunch. ${lunchPlace.local_tip || 'Don\'t miss their signature dishes!'}`
      });
      currentCost += lunchPlace.entry_fee || 25;
    }

    // Afternoon Activity 1 (2:00 PM - 4:00 PM)
    const afternoonPlace1 = dayPlaces[placeIndex++];
    if (afternoonPlace1) {
      schedule.push({
        ...afternoonPlace1,
        start_time: formatTime(14, 0),
        end_time: formatTime(16, 0),
        activity_type: 'afternoon_main',
        description: createActivityDescription(afternoonPlace1, 'afternoon'),
        notes: `${afternoonPlace1.ml_reasons?.join('. ') || 'A must-visit attraction.'} Allow 2 hours to fully experience this place.`
      });
      currentCost += afternoonPlace1.entry_fee || 0;
    }

    // Afternoon Activity 2 (4:30 PM - 6:00 PM)
    const afternoonPlace2 = dayPlaces[placeIndex++];
    if (afternoonPlace2) {
      schedule.push({
        ...afternoonPlace2,
        start_time: formatTime(16, 30),
        end_time: formatTime(18, 0),
        activity_type: 'late_afternoon',
        description: createActivityDescription(afternoonPlace2, 'afternoon'),
        notes: `${afternoonPlace2.ml_reasons?.join('. ') || 'Great afternoon destination.'}`
      });
      currentCost += afternoonPlace2.entry_fee || 0;
    }

    // EVENING (6:00 PM - 10:00 PM)
    
    // Evening Activity (6:30 PM - 8:00 PM)
    const eveningPlace = dayPlaces[placeIndex++];
    if (eveningPlace) {
      schedule.push({
        ...eveningPlace,
        start_time: formatTime(18, 30),
        end_time: formatTime(20, 0),
        activity_type: 'early_evening',
        description: createActivityDescription(eveningPlace, 'evening') + ` Perfect timing to catch the sunset and evening ambiance.`,
        notes: `${eveningPlace.ml_reasons?.join('. ') || 'Ideal for evening visits.'} Bring your camera for stunning photos!`
      });
      currentCost += eveningPlace.entry_fee || 0;
    }

    // Dinner (8:30 PM - 10:00 PM)
    const dinnerPlace = dayPlaces[placeIndex++];
    if (dinnerPlace) {
      schedule.push({
        ...dinnerPlace,
        start_time: formatTime(20, 30),
        end_time: formatTime(22, 0),
        activity_type: 'dinner',
        description: `End your day with a memorable dinner at ${dinnerPlace.name}. ${dinnerPlace.description || 'Experience the finest local cuisine and ambiance.'}`,
        notes: `${dinnerPlace.local_tip || 'Reservations recommended for dinner time.'} Perfect way to conclude your day.`
      });
      currentCost += dinnerPlace.entry_fee || 35;
    }

    // Last day departure note
    if (isLastDay) {
      schedule.push({
        place_id: `departure_${dayNumber}`,
        name: 'Departure Preparation',
        start_time: formatTime(22, 0),
        end_time: formatTime(23, 0),
        category: ['logistics'],
        activity_type: 'departure',
        description: `Pack your belongings and prepare for departure. Reflect on the wonderful memories you've made in ${destination}.`,
        entry_fee: 0,
        tags: ['logistics', 'departure'],
        rating: 0,
        notes: 'Check your flight/travel times and set an alarm. Safe travels!'
      });
    }

    return {
      day: dayNumber,
      theme: theme.name,
      theme_description: theme.focus,
      places: schedule,
      total_cost: Math.round(currentCost),
      budget_remaining: Math.round(budgetPerDay - currentCost),
      summary: `Day ${dayNumber} focuses on ${theme.focus.toLowerCase()}. You'll visit ${schedule.filter(p => p.activity_type && !['breakfast', 'lunch', 'dinner', 'arrival', 'departure'].includes(p.activity_type)).length} main attractions, with carefully planned meal breaks and optimal timing for each location.`
    };
  }

  // Select appropriate places for a day - ENSURES NO REPETITION
  selectPlacesForDay(allPlaces, dayNumber, interests, count) {
    const startIndex = (dayNumber - 1) * count;
    let selectedPlaces = allPlaces.slice(startIndex, startIndex + count);
    
    // Only add more if we don't have enough AND we haven't used all places yet
    if (selectedPlaces.length < count) {
      const remainingPlaces = allPlaces.slice(startIndex + selectedPlaces.length);
      const needed = count - selectedPlaces.length;
      
      if (remainingPlaces.length > 0) {
        selectedPlaces = [...selectedPlaces, ...remainingPlaces.slice(0, needed)];
      }
      
      // If still not enough, log warning but don't repeat
      if (selectedPlaces.length < count) {
        logger.warn(`⚠️ Day ${dayNumber}: Only ${selectedPlaces.length} unique places available (needed ${count})`);
      }
    }
    
    return selectedPlaces;
  }
}

module.exports = new ComprehensiveItineraryGenerator();
