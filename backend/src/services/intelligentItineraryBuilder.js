const logger = require( '../utils/logger' ); // Import the logger utility for logging messages

class IntelligentItineraryBuilder
{

  /**
   * Builds a complete itinerary based on user preferences and available places.
   * @param {string} destination - The target destination (e.g., "Paris, France").
   * @param {number} days - Number of days for the itinerary.
   * @param {number} budget - Total budget for the trip.
   * @param {string[]} interests - List of user interests (e.g., "nature", "history").
   * @param {Array} allPlaces - Array of all available place objects.
   * @param {number} placesPerDay - flexible limit for places per day (default 7).
   * @returns {Array} - The generated itinerary (array of day objects).
   */
  buildItinerary ( destination, days, budget, interests, allPlaces, placesPerDay = 7 )
  {
    // Log the start of the itinerary building process with key parameters
    logger.info( `🎯 Building ${ days }-day itinerary for ${ destination }` );
    // Log the total number of places available for processing
    logger.info( `📦 Received ${ allPlaces.length } total places` );

    // FILTER: Keep only places within reasonable distance (same city/region)
    // Relaxed filter: Rely on upstream services to provide relevant places.
    // The previous 30km filter based on allPlaces[0] was too risky if the first place was an outlier.

    /* 
    // Legacy code block for strict distance filtering (commented out)
    const centerPlace = allPlaces[ 0 ]; // Assume the first place is central
    if ( centerPlace && centerPlace.location ) // Check if location data exists
    {
      // Filter logic to keep places within a specific radius
      const filteredPlaces = allPlaces.filter( place =>
      {
         // ... strict logic removed ...
         return true; // Currently allowing all places
      } );
    }
    */

    // Log the count of places actually being used after any preliminary filtering
    logger.info( `📦 Using ${ allPlaces.length } places for itinerary building` );

    // Categorize places into buckets like nature, shopping, restaurants etc.
    const categorized = this.categorizePlaces( allPlaces );

    // Calculate the daily budget allocation
    const dailyBudget = Math.floor( budget / days );
    // Determine the budget level (low, medium, high) based on daily amount
    const budgetLevel = this.getBudgetLevel( dailyBudget );

    // PRIORITIZE activities based on user interests
    // Initialize an empty array to hold the prioritized list of activities
    let activities = [];
    // Convert user interests to a Set for efficient O(1) lookups and case-insensitivity
    const interestSet = new Set( interests.map( i => i.toLowerCase().trim() ) );

    // 1. Add High Priority categories first based on matching interests

    // Check if user is interested in nature or outdoors
    if ( interestSet.has( 'nature' ) || interestSet.has( 'outdoors' ) )
    {
      // Add all nature-related places to the activities list
      activities.push( ...categorized.nature );
    }

    // Check if user is interested in shopping or fashion
    if ( interestSet.has( 'shopping' ) || interestSet.has( 'fashion' ) )
    {
      // Add all shopping-related places to the activities list
      activities.push( ...categorized.shopping );
    }

    // Check if user is interested in viewpoints or scenic views
    if ( interestSet.has( 'viewpoints' ) || interestSet.has( 'views' ) )
    {
      // Add all viewpoint-related places to the activities list
      activities.push( ...categorized.viewpoints );
    }

    // Check if user is interested in culture, history, or art
    if ( interestSet.has( 'culture' ) || interestSet.has( 'history' ) || interestSet.has( 'art' ) )
    {
      // Add all general attractions (mostly cultural) to the activities list
      activities.push( ...categorized.attractions );
    }

    // 2. Add everything else to ensure we have enough options (deduplication will handle overlaps)
    // Add attractions again (if not already added, or duplications will be removed later)
    activities.push( ...categorized.attractions );
    // Add nature places again
    activities.push( ...categorized.nature );
    // Add shopping places again
    activities.push( ...categorized.shopping );
    // Add viewpoints again
    activities.push( ...categorized.viewpoints );

    // 3. Flatten and keep unique (order is preserved, so high priority stays first)
    // Extract restaurants from the categorized object
    const restaurants = categorized.restaurants;

    // Remove duplicate activities ensuring unique place IDs
    const uniqueActivities = this.removeDuplicates( activities );
    // Remove duplicate restaurants ensuring unique place IDs
    const uniqueRestaurants = this.removeDuplicates( restaurants );

    // Log the final counts of unique available activities and restaurants
    logger.info( `📊 Available places: ${ uniqueActivities.length } activities, ${ uniqueRestaurants.length } restaurants` );

    // Calculate minimum places needed to fill the itinerary
    const activitiesPerDay = 4; // Target: breakfast, lunch, dinner + 4 activities = 7 total
    const restaurantsPerDay = 3; // Target: breakfast, lunch, dinner
    // Total minimum activities needed for the entire trip
    const minActivitiesNeeded = days * activitiesPerDay;
    // Total minimum restaurants needed for the entire trip
    const minRestaurantsNeeded = days * restaurantsPerDay;

    // Log the requirements vs availability
    logger.info( `🎯 Need: ${ minActivitiesNeeded } activities, ${ minRestaurantsNeeded } restaurants` );
    logger.info( `✅ Have: ${ uniqueActivities.length } activities, ${ uniqueRestaurants.length } restaurants` );

    // If insufficient places, expand by duplicating with variations to fill the schedule
    if ( uniqueActivities.length < minActivitiesNeeded )
    {
      // Log a warning if we are short on activities
      logger.warn( `⚠️ Insufficient activities! Expanding pool...` );
      // Create variations of existing activities to meet the minimum count
      const expanded = this.expandPlacePool( uniqueActivities, minActivitiesNeeded );
      // Add the expanded variations to the main list
      uniqueActivities.push( ...expanded );
      // Log the new total count
      logger.info( `✅ Expanded to ${ uniqueActivities.length } activities` );
    }

    // specific check for restaurants
    if ( uniqueRestaurants.length < minRestaurantsNeeded )
    {
      // Log a warning if we are short on restaurants
      logger.warn( `⚠️ Insufficient restaurants! Expanding pool...` );
      // Create variations of existing restaurants to meet the minimum count
      const expanded = this.expandPlacePool( uniqueRestaurants, minRestaurantsNeeded );
      // Add the expanded variations to the main list
      uniqueRestaurants.push( ...expanded );
      // Log the new total count
      logger.info( `✅ Expanded to ${ uniqueRestaurants.length } restaurants` );
    }

    // Log a sample of the activities and restaurants for debugging/verification
    logger.info( `📝 Sample activities: ${ uniqueActivities.slice( 0, 5 ).map( p => p.name ).join( ', ' ) }` );
    logger.info( `📝 Sample restaurants: ${ uniqueRestaurants.slice( 0, 5 ).map( p => p.name ).join( ', ' ) }` );

    // Shuffle the arrays to ensure variety and randomness in the itinerary
    this.shuffleArray( uniqueActivities );
    this.shuffleArray( uniqueRestaurants );

    // Initialize the final itinerary array
    const itinerary = [];
    // Sets to track global usage of places across all days to avoid repetition
    const usedPlaceIds = new Set();
    const usedNames = new Set();

    // Iterate through each day of the trip to build the daily schedule
    for ( let day = 1; day <= days; day++ )
    {
      // Build the itinerary for the specific day
      const dayData = this.buildDay(
        day, destination, dailyBudget, budgetLevel,
        uniqueActivities, uniqueRestaurants,
        usedPlaceIds, usedNames, day === 1, day === days, placesPerDay
      );

      // Log the summary for the built day
      logger.info( `✅ Day ${ day }: ${ dayData.places.length } places, ${ dayData.places.filter( p => p.activity_type !== 'arrival' && p.activity_type !== 'departure' ).map( p => p.display_name || p.name ).join( ', ' ) }` );

      // Add the day's data to the itinerary
      itinerary.push( dayData );
    }

    // Return the completed itinerary structure
    return itinerary;
  }

  // Expand place pool by creating variations when insufficient places exist
  expandPlacePool ( places, targetCount )
  {
    // Initialize array for new variations
    const expanded = [];
    // Calculate how many more items are needed
    const needed = targetCount - places.length;

    // If no places are needed or input list is empty, return empty list
    if ( needed <= 0 || places.length === 0 ) return expanded;

    // Log the expansion process
    logger.info( `🔄 Creating ${ needed } place variations...` );

    // Generatively create variations
    for ( let i = 0; i < needed; i++ )
    {
      // Select an original place modulo length to cycle through them
      const original = places[ i % places.length ];
      // Create a superficial variation object
      const variation = {
        ...original, // Copy all original properties
        place_id: `${ original.place_id }_var_${ i }`, // Generate a unique ID
        name: original.name, // Keep the same name
        description: original.description || `Visit ${ original.name }`, // Ensure description exists
        // Keep all other properties the same
      };
      // Add variation to the list
      expanded.push( variation );
    }

    // Return the list of generated variations
    return expanded;
  }

  // detailed logic to build a single day's itinerary
  buildDay ( day, destination, dailyBudget, budgetLevel, activities, restaurants,
    usedPlaceIds, usedNames, isFirst, isLast, placesPerDay )
  {

    // Initialize array to hold the ordered places for the day
    const places = [];
    // Track total cost for this day
    let totalCost = 0;
    // Initialize current time pointer (start at 6 AM)
    let currentTime = '06:00';

    // Define meal costs based on the calculated budget level
    const meals = {
      low: { breakfast: 12, lunch: 20, dinner: 30 },
      medium: { breakfast: 20, lunch: 35, dinner: 70 },
      high: { breakfast: 35, lunch: 55, dinner: 150 }
    }[ budgetLevel ];

    // Track places used in THIS day to prevent duplicate visits in the same day (redundant with global set but good for safety)
    const usedInThisDay = new Set();
    // Track the last visited location object to calculate travel times
    let lastLocation = null;

    // Helper function to calculate and add a travel time slot between two places
    const addTravelTime = ( fromPlace, toPlace ) =>
    {
      // Return early if locations are missing or undefined
      if ( !fromPlace || !toPlace || !fromPlace.location || !toPlace.location ) return;

      // Calculate distance in km between the two points
      const distance = this.calculateDistance(
        fromPlace.location.lat, fromPlace.location.lng,
        toPlace.location.lat, toPlace.location.lng
      );

      // Only add travel time entry if the distance is significant (> 5km)
      if ( distance > 5 )
      {
        // Estimate the time needed to travel
        const travelMinutes = this.estimateTravelTime( distance );
        // Determine mode of transport based on distance
        const travelMode = distance > 20 ? 'Drive' : distance > 10 ? 'Taxi' : 'Metro';
        // Select appropriate icon
        const travelIcon = distance > 20 ? '🚗' : distance > 10 ? '🚕' : '🚇';

        // Get destination name (clean, without area suffix) for display
        const toName = toPlace.name || 'next location';

        // Set start time for travel
        const startTime = currentTime;
        // Update current global time pointer after travel
        currentTime = this.addMinutes( currentTime, travelMinutes );

        // Add the travel segment to the places list
        places.push( {
          place_id: `travel_${ day }_${ places.length }`, // Unique ID for travel segment
          name: `${ travelIcon } ${ travelMode } to ${ toName }`, // Display title
          display_name: `${ travelIcon } ${ travelMode } to ${ toName }`,
          start_time: startTime, // Departure time
          end_time: currentTime, // Arrival time
          activity_type: 'travel', // Type marker
          category: [ 'logistics' ],
          description: `${ Math.round( distance ) }km · ${ Math.round( travelMinutes ) } min by ${ travelMode.toLowerCase() }`,
          entry_fee: 0, // Travel cost ignored for simplicity here
          rating: 0,
          tags: [ 'travel', 'logistics' ],
          distance_km: Math.round( distance ),
          travel_minutes: Math.round( travelMinutes )
        } );
      }
    };

    // Helper to get a unique activity from the pool
    const getActivity = () =>
    {
      // Iterate through available activities to find an unused one
      // First try to get unused place (never used before in ANY day)
      for ( let i = 0; i < activities.length; i++ )
      {
        const place = activities[ i ];
        // Normalize name for string comparison
        const normalizedName = ( place.name || '' ).toLowerCase().trim();

        // Check against global used sets
        if ( !usedPlaceIds.has( place.place_id ) && !usedNames.has( normalizedName ) )
        {
          // Mark as used
          usedPlaceIds.add( place.place_id );
          usedInThisDay.add( place.place_id );
          usedNames.add( normalizedName );
          // Log selection
          logger.info( `✅ Selected NEW activity: ${ place.name }` );
          // Return a shallow copy to avoid mutating original source array deeply
          return { ...place };
        }
      }

      // If we reach here, we've run out of unique places!
      logger.warn( `⚠️ WARNING: Ran out of unique activities!` );

      // Return null, indicating failure to find a unique activity
      return null;
    };

    // Helper to get a unique restaurant from the pool
    const getRestaurant = () =>
    {
      // Iterate through available restaurants
      // First try to get unused restaurant (never used before in ANY day)
      for ( let i = 0; i < restaurants.length; i++ )
      {
        const place = restaurants[ i ];
        const normalizedName = ( place.name || '' ).toLowerCase().trim();

        // Check against global used sets
        if ( !usedPlaceIds.has( place.place_id ) && !usedNames.has( normalizedName ) )
        {
          // Mark as used
          usedPlaceIds.add( place.place_id );
          usedInThisDay.add( place.place_id );
          usedNames.add( normalizedName );
          // Log selection
          logger.info( `✅ Selected NEW restaurant: ${ place.name }` );
          return { ...place }; // Return a copy
        }
      }

      // If we run out of unique restaurants, return null (NO fake places)
      // Users can find their own food if our DB is empty
      return null;
    };

    // Handle arrival logic for the first day
    if ( isFirst )
    {
      // Create a dedicated arrival "place" object
      const arrivalPlace = {
        place_id: `arrival_${ day }`, // ID
        name: `Arrive in ${ destination }`, // Title
        start_time: currentTime,
        end_time: this.addMinutes( currentTime, 120 ), // Assume 2 hours for arrival
        activity_type: 'arrival',
        category: [ 'logistics' ],
        description: `Welcome to ${ destination }! Get settled in.`,
        entry_fee: 0,
        rating: 0,
        tags: [ 'arrival' ]
      };
      // Add to itinerary
      places.push( arrivalPlace );
      // Advance time
      currentTime = arrivalPlace.end_time;
      // Set last location to arrival for potential future calculations (though arrival usually has no coords)
      lastLocation = arrivalPlace;
    }

    // --- BREAKFAST ---
    const breakfast = getRestaurant();
    if ( breakfast )
    {
      // Calculate travel from previous location (e.g. hotel/arrival)
      addTravelTime( lastLocation, breakfast );
      // Enrich place object with location details
      const enrichedBreakfast = this.enrichPlaceWithLocation( breakfast, destination );
      // Create the scheduled event object
      const breakfastPlace = {
        ...enrichedBreakfast,
        start_time: currentTime,
        end_time: this.addMinutes( currentTime, 60 ), // 1 hour for breakfast
        activity_type: 'breakfast',
        entry_fee: meals.breakfast, // Estimated cost
        description: enrichedBreakfast.description || `Breakfast at ${ enrichedBreakfast.name }`
      };
      places.push( breakfastPlace );
      totalCost += meals.breakfast;
      currentTime = breakfastPlace.end_time;
      lastLocation = breakfast;
    }

    // --- MORNING ACTIVITY ---
    const morning = getActivity();
    if ( morning )
    {
      addTravelTime( lastLocation, morning );
      const enrichedMorning = this.enrichPlaceWithLocation( morning, destination );
      const morningPlace = {
        ...enrichedMorning,
        start_time: currentTime,
        end_time: this.addMinutes( currentTime, 150 ), // 2.5 hours duration
        activity_type: 'morning',
        description: enrichedMorning.description || `Visit this attraction in ${ destination.split( ',' )[ 0 ] }`
      };
      places.push( morningPlace );
      totalCost += morning.entry_fee || 0; // Add entry fee if known
      currentTime = morningPlace.end_time;
      lastLocation = morning;
    }

    // --- LUNCH ---
    const lunch = getRestaurant();
    if ( lunch )
    {
      addTravelTime( lastLocation, lunch );
      const enrichedLunch = this.enrichPlaceWithLocation( lunch, destination );
      const lunchPlace = {
        ...enrichedLunch,
        start_time: currentTime,
        end_time: this.addMinutes( currentTime, 90 ), // 1.5 hours for lunch
        activity_type: 'lunch',
        entry_fee: meals.lunch,
        description: enrichedLunch.description || `Lunch at ${ enrichedLunch.name }`
      };
      places.push( lunchPlace );
      totalCost += meals.lunch;
      currentTime = lunchPlace.end_time;
      lastLocation = lunch;
    }

    // --- AFTERNOON ACTIVITY 1 ---
    const afternoon1 = getActivity();
    if ( afternoon1 )
    {
      addTravelTime( lastLocation, afternoon1 );
      const enrichedAfternoon1 = this.enrichPlaceWithLocation( afternoon1, destination );
      const afternoon1Place = {
        ...enrichedAfternoon1,
        start_time: currentTime,
        end_time: this.addMinutes( currentTime, 120 ), // 2 hours duration
        activity_type: 'afternoon',
        description: enrichedAfternoon1.description || `Explore this popular attraction`
      };
      places.push( afternoon1Place );
      totalCost += afternoon1.entry_fee || 0;
      currentTime = afternoon1Place.end_time;
      lastLocation = afternoon1;
    }

    // --- AFTERNOON ACTIVITY 2 ---
    const afternoon2 = getActivity();
    if ( afternoon2 )
    {
      addTravelTime( lastLocation, afternoon2 );
      const enrichedAfternoon2 = this.enrichPlaceWithLocation( afternoon2, destination );
      const afternoon2Place = {
        ...enrichedAfternoon2,
        start_time: currentTime,
        end_time: this.addMinutes( currentTime, 90 ), // 1.5 hours duration
        activity_type: 'late_afternoon',
        description: enrichedAfternoon2.description || `Visit this interesting place`
      };
      places.push( afternoon2Place );
      totalCost += afternoon2.entry_fee || 0;
      currentTime = afternoon2Place.end_time;
      lastLocation = afternoon2;
    }

    // --- EVENING ACTIVITY ---
    const evening = getActivity();
    if ( evening )
    {
      addTravelTime( lastLocation, evening );
      const enrichedEvening = this.enrichPlaceWithLocation( evening, destination );
      const eveningPlace = {
        ...enrichedEvening,
        start_time: currentTime,
        end_time: this.addMinutes( currentTime, 60 ), // 1 hour duration
        activity_type: 'evening',
        description: enrichedEvening.description || `Evening visit to this location`
      };
      places.push( eveningPlace );
      totalCost += evening.entry_fee || 0;
      currentTime = eveningPlace.end_time;
      lastLocation = evening;
    }

    // --- DINNER ---
    const dinner = getRestaurant();
    if ( dinner )
    {
      addTravelTime( lastLocation, dinner );
      const enrichedDinner = this.enrichPlaceWithLocation( dinner, destination );
      const dinnerPlace = {
        ...enrichedDinner,
        start_time: currentTime,
        end_time: this.addMinutes( currentTime, 90 ), // 1.5 hours for dinner
        activity_type: 'dinner',
        entry_fee: meals.dinner,
        description: enrichedDinner.description || `Dinner at ${ enrichedDinner.name }`
      };
      places.push( dinnerPlace );
      totalCost += meals.dinner;
      currentTime = dinnerPlace.end_time;
      lastLocation = dinner;
    }

    // Handle departure logic for the last day
    if ( isLast )
    {
      places.push( {
        place_id: `departure_${ day }`,
        name: 'Departure',
        start_time: '22:00', // Late evening departure assumed
        end_time: '23:00',
        activity_type: 'departure',
        category: [ 'logistics' ],
        description: `Pack your bags and prepare for your journey home.`,
        entry_fee: 0,
        rating: 0,
        tags: [ 'departure' ]
      } );
    }

    // Get a thematic description for the day
    const theme = this.getTheme( day, isFirst, isLast );

    // Return the aggregated day object
    return {
      day,
      theme: theme.name,
      theme_description: theme.description,
      emoji: theme.emoji,
      places, // The list of scheduled events
      total_cost: Math.round( totalCost ), // Rounded total cost
      budget_remaining: Math.round( dailyBudget - totalCost ), // Remaining budget
      summary: `Day ${ day }: ${ theme.description }` // Human readable summary
    };
  }

  // Helper method to categorize places into functional groups
  categorizePlaces ( places )
  {
    const categorized = {
      attractions: [],
      restaurants: [],
      nature: [],
      shopping: [],
      viewpoints: []
    };

    // Iterate through all input places
    places.forEach( p =>
    {
      // Normalize categories and name for comparison
      const cats = ( p.category || [] ).map( c => c.toLowerCase() );
      const name = ( p.name || '' ).toLowerCase();
      // const tags = (p.tags || []).map(t => t.toLowerCase()); // unused but available

      // Check if it's a restaurant/cafe (priority check)
      if ( cats.some( c =>
        c.includes( 'restaurant' ) || c.includes( 'cafe' ) || c.includes( 'food' ) ||
        c.includes( 'bar' ) || c.includes( 'bistro' ) || c.includes( 'eatery' ) ||
        c.includes( 'fast_food' ) || c.includes( 'pub' )
      ) || name.includes( 'restaurant' ) || name.includes( 'cafe' ) || name.includes( 'bistro' ) )
      {
        categorized.restaurants.push( p );
      }
      // Check if it's nature related
      else if ( cats.some( c =>
        c.includes( 'park' ) || c.includes( 'garden' ) || c.includes( 'nature' ) ||
        c.includes( 'beach' ) || c.includes( 'forest' ) || c.includes( 'lake' )
      ) )
      {
        categorized.nature.push( p );
      }
      // Check if it's shopping related
      else if ( cats.some( c =>
        c.includes( 'shopping' ) || c.includes( 'market' ) || c.includes( 'mall' ) ||
        c.includes( 'store' ) || c.includes( 'boutique' )
      ) )
      {
        categorized.shopping.push( p );
      }
      // Check if it's a viewpoint or deck
      else if ( cats.some( c =>
        c.includes( 'viewpoint' ) || c.includes( 'tower' ) || c.includes( 'observation' ) ||
        c.includes( 'overlook' ) || c.includes( 'deck' )
      ) )
      {
        categorized.viewpoints.push( p );
      }
      // Default to general attraction if no other category matches
      else
      {
        categorized.attractions.push( p );
      }
    } );

    // Log the distribution counts
    logger.info( `📊 Categorized: ${ categorized.attractions.length } attractions, ${ categorized.restaurants.length } restaurants, ${ categorized.nature.length } nature, ${ categorized.shopping.length } shopping, ${ categorized.viewpoints.length } viewpoints` );

    return categorized;
  }

  // Remove duplicate places based on ID or normalized name
  removeDuplicates ( places )
  {
    const seenIds = new Set();
    const seenNames = new Set();
    const unique = [];

    places.forEach( p =>
    {
      const normalizedName = ( p.name || '' ).toLowerCase().trim();

      // Check if already seen
      if ( !seenIds.has( p.place_id ) && !seenNames.has( normalizedName ) )
      {
        seenIds.add( p.place_id );
        seenNames.add( normalizedName );
        unique.push( p ); // Add to unique list
      }
    } );
    return unique;
  }

  // Fisher-Yates shuffle algorithm to randomize array order
  shuffleArray ( array )
  {
    for ( let i = array.length - 1; i > 0; i-- )
    {
      // Pick a random index from 0 to i
      const j = Math.floor( Math.random() * ( i + 1 ) );
      // Swap elements at i and j
      [ array[ i ], array[ j ] ] = [ array[ j ], array[ i ] ];
    }
  }

  // Determine budget level string based on daily budget amount
  getBudgetLevel ( dailyBudget )
  {
    if ( dailyBudget < 100 ) return 'low';
    if ( dailyBudget < 300 ) return 'medium';
    return 'high';
  }

  // Get a thematic title/description for the day
  getTheme ( day, isFirst, isLast )
  {
    // Special themes for first and last days
    if ( isFirst ) return { name: 'Arrival & Exploration', description: 'Getting oriented', emoji: '❤️' };
    if ( isLast ) return { name: 'Farewell', description: 'Final experiences', emoji: '💞' };

    // Rotating themes for middle days
    const themes = [
      { name: 'Culture', description: 'Museums and heritage', emoji: '🎨' },
      { name: 'Nature', description: 'Parks and outdoors', emoji: '🌿' },
      { name: 'Local Life', description: 'Authentic experiences', emoji: '🍜' }
    ];
    // Return theme based on day index
    return themes[ ( day - 2 ) % themes.length ];
  }

  // Calculate distance between two locations (Haversine formula)
  // Returns distance in kilometers
  calculateDistance ( lat1, lng1, lat2, lng2 )
  {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad( lat2 - lat1 );
    const dLng = this.toRad( lng2 - lng1 );
    const a = Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) +
      Math.cos( this.toRad( lat1 ) ) * Math.cos( this.toRad( lat2 ) ) *
      Math.sin( dLng / 2 ) * Math.sin( dLng / 2 );
    const c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
    return R * c; // Distance in km
  }

  // Convert degrees to radians
  toRad ( degrees )
  {
    return degrees * ( Math.PI / 180 );
  }

  // Estimate travel time based on distance
  // Returns estimated minutes
  estimateTravelTime ( distanceKm )
  {
    if ( distanceKm < 5 ) return 15; // 15 minutes for nearby places
    if ( distanceKm < 10 ) return 30; // 30 minutes
    if ( distanceKm < 20 ) return 45; // 45 minutes
    if ( distanceKm < 50 ) return 90; // 1.5 hours
    if ( distanceKm < 100 ) return 120; // 2 hours
    return 180; // 3 hours for long distances
  }

  // Add minutes to a time string in "HH:MM" format
  addMinutes ( time, minutes )
  {
    const [ hours, mins ] = time.split( ':' ).map( Number );
    const totalMins = hours * 60 + mins + minutes;
    const newHours = Math.floor( totalMins / 60 ) % 24; // Wrap around 24h
    const newMins = totalMins % 60;
    // Format back to "HH:MM"
    return `${ String( newHours ).padStart( 2, '0' ) }:${ String( newMins ).padStart( 2, '0' ) }`;
  }

  // Check if two places are in different cities (>20km apart)
  isDifferentCity ( loc1, loc2 )
  {
    if ( !loc1 || !loc2 ) return false;
    const distance = this.calculateDistance( loc1.lat, loc1.lng, loc2.lat, loc2.lng );
    return distance > 20; // Consider different city if >20km apart
  }

  // Extract area/city name from address or place name
  extractAreaName ( addressOrName )
  {
    if ( !addressOrName ) return null;

    // Skip if contains non-Latin characters (simplified check)
    if ( /[^\x00-\x7F]/.test( addressOrName ) )
    {
      return null;
    }

    // If it's an address, try to extract city/district
    if ( addressOrName.includes( ',' ) )
    {
      const parts = addressOrName.split( ',' ).map( p => p.trim() ).filter( p => p.length > 0 );

      // Try to find the city/district (usually second-to-last or last part)
      for ( let i = parts.length - 1; i >= 0; i-- )
      {
        const part = parts[ i ];
        // Skip country names and very short parts to avoid false positives
        if ( part.length > 2 &&
          !part.toLowerCase().includes( 'korea' ) &&
          !part.toLowerCase().includes( 'japan' ) &&
          !part.toLowerCase().includes( 'china' ) &&
          !/[^\x00-\x7F]/.test( part ) )
        {
          return part;
        }
      }
    }

    // Otherwise return null if extraction fails
    return null;
  }

  // Add city/area info to place name - DYNAMIC based on place's actual location
  enrichPlaceWithLocation ( place, defaultCity )
  {
    if ( !place ) return place;

    let area = null;

    // PRIORITY 1: Use place's own city field (from OSM data)
    if ( place.city && !/[^\x00-\x7F]/.test( place.city ) )
    {
      area = place.city;
      logger.info( `✅ Using place.city: ${ area }` );
    }

    // PRIORITY 2: Try to extract from address
    if ( !area && place.address )
    {
      area = this.extractAreaName( place.address );
      if ( area ) logger.info( `✅ Extracted from address: ${ area }` );
    }

    // PRIORITY 3: Use default city (ALWAYS since all places within 30km)
    if ( !area && defaultCity )
    {
      // Extract just the city name from "Seoul, South Korea" format
      area = defaultCity.split( ',' )[ 0 ].trim();
      logger.info( `✅ Using default city: ${ area }` );
    }

    // ALWAYS add area to place name for clarity if not already present
    if ( area && !place.name.toLowerCase().includes( area.toLowerCase() ) )
    {
      place.display_name = `${ place.name }, ${ area }`;
      place.area = area;
      logger.info( `✅ Final: "${ place.name }" → "${ place.display_name }"` );
    } else
    {
      place.display_name = place.name;
      place.area = area;
      logger.info( `⚠️ Skipped (already in name): "${ place.name }"` );
    }

    return place;
  }
}

// Export a singleton instance of the builder
module.exports = new IntelligentItineraryBuilder();
