const axios = require( 'axios' );
const logger = require( '../utils/logger' );
const { getRealPlacesForDestination, searchPlacesByCategory, getPopularPlaces } = require( './comprehensiveRealPlacesDB' );
const placePersistenceService = require( './placePersistenceService' );


class RealDataService
{
  constructor ()
  {
    this.googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
    this.weatherKey = process.env.OPENWEATHER_KEY;
    this.baseGoogleUrl = 'https://maps.googleapis.com/maps/api';
    this.weatherUrl = 'https://api.openweathermap.org/data/2.5';
    this.hasValidGoogleKey = this.googleMapsKey && this.googleMapsKey !== 'YOUR_REAL_GOOGLE_MAPS_KEY_HERE';
    this.hasValidWeatherKey = this.weatherKey && this.weatherKey !== 'YOUR_REAL_OPENWEATHER_KEY_HERE';
  }

  async getDestinationCoordinates ( destination )
  {
    try
    {
      const response = await axios.get( `${ this.baseGoogleUrl }/geocode/json`, {
        params: {
          address: destination,
          key: this.googleMapsKey
        }
      } );

      if ( response.data.results && response.data.results.length > 0 )
      {
        const result = response.data.results[ 0 ];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address,
          place_id: result.place_id
        };
      }
      throw new Error( 'Location not found' );
    } catch ( error )
    {
      logger.error( 'Geocoding error:', error );
      throw new Error( `Failed to find location: ${ destination }` );
    }
  }

  async getRealPlaces ( destination, interests = [], radius = 25000 )
  {
    console.log( `🌍 REAL-TIME: Getting LOTS of places for ${ destination } with interests:`, interests );

    // Check if destination is a country - if so, use capital city
    const adjustedDestination = this.getSpecificLocation( destination );
    if ( adjustedDestination !== destination )
    {
      console.log( `🎯 Country detected! Using ${ adjustedDestination } instead of ${ destination }` );
      destination = adjustedDestination;
    }

    let allPlaces = [];
    const API_TIMEOUT = 45000; // 45 second timeout (increased)

    // PRIORITY 1: FREE APIs (OpenTripMap + Overpass) - NO KEY NEEDED!
    try
    {
      console.log( `🆓 FREE APIS: Fetching from OpenTripMap + Overpass (NO KEY NEEDED)...` );
      const freePlacesAPI = require( './freePlacesAPI' );
      const freePlacesPromise = freePlacesAPI.getRealPlaces( destination, interests, 200 );
      const timeoutPromise = new Promise( ( _, reject ) =>
        setTimeout( () => reject( new Error( 'Free APIs timeout' ) ), API_TIMEOUT )
      );

      const freePlaces = await Promise.race( [ freePlacesPromise, timeoutPromise ] );

      if ( freePlaces.length > 0 )
      {
        allPlaces = [ ...allPlaces, ...freePlaces ];
        console.log( `✅ FREE APIS: Got ${ freePlaces.length } places from FREE APIs!` );
      }
    } catch ( freeError )
    {
      console.warn( `⚠️ Free APIs failed:`, freeError.message );
    }

    // PRIORITY 2: Google Places API (if key available)
    if ( this.hasValidGoogleKey )
    {
      try
      {
        console.log( `🔥 GOOGLE PLACES: Fetching from Google Places API...` );
        const coordinates = await this.getDestinationCoordinates( destination );

        // Search multiple types to get variety
        const searchTypes = [
          'tourist_attraction',
          'museum',
          'restaurant',
          'cafe',
          'park',
          'shopping_mall',
          'point_of_interest'
        ];

        const googlePlacesPromises = searchTypes.map( type =>
          this.searchPlacesByType( coordinates, type, radius ).catch( err =>
          {
            console.warn( `⚠️ Google Places ${ type } failed:`, err.message );
            return [];
          } )
        );

        const googlePlacesResults = await Promise.all( googlePlacesPromises );
        const googlePlaces = googlePlacesResults.flat();

        // Convert to our format
        const formattedGooglePlaces = googlePlaces.map( place => ( {
          place_id: place.place_id,
          name: place.name,
          category: this.mapGoogleTypesToCategories( place.types || [] ),
          location: place.location,
          rating: place.rating || 4.0,
          entry_fee: this.estimateEntryFee( place.price_level, place.types || [] ),
          tags: this.generateTags( place.types || [], place.rating || 4.0 ),
          description: this.generateDescription( place.name, place.types || [], place.rating || 4.0 ),
          address: place.vicinity || '',
          photos: place.photos || []
        } ) );

        allPlaces = [ ...allPlaces, ...formattedGooglePlaces ];
        console.log( `✅ GOOGLE: Got ${ formattedGooglePlaces.length } places from Google Places API` );
      } catch ( googleError )
      {
        console.warn( `⚠️ Google Places API failed:`, googleError.message );
      }
    }

    // PRIORITY 3: Wikidata (LIVE DATA)
    try
    {
      console.log( `🌐 WIKIDATA: Fetching from Wikidata/Wikipedia API...` );
      const wikidataPlacesService = require( './wikidataPlacesService' );
      const wikidataPromise = wikidataPlacesService.getRealPlaces( destination, interests, 200 );
      const timeoutPromise = new Promise( ( _, reject ) =>
        setTimeout( () => reject( new Error( 'Wikidata timeout' ) ), API_TIMEOUT )
      );

      const wikidataPlaces = await Promise.race( [ wikidataPromise, timeoutPromise ] );

      if ( wikidataPlaces.length > 0 )
      {
        allPlaces = [ ...allPlaces, ...wikidataPlaces ];
        console.log( `✅ WIKIDATA: Got ${ wikidataPlaces.length } places from Wikidata` );
      }
    } catch ( wikidataError )
    {
      console.warn( `⚠️ Wikidata failed or timed out:`, wikidataError.message );
    }

    // PRIORITY 4: OpenStreetMap Nominatim API
    try
    {
      console.log( `🗺️ OSM: Fetching from OpenStreetMap Nominatim API...` );
      const openStreetMapService = require( './openStreetMapService' );
      const osmPromise = openStreetMapService.getRealPlacesForDestination( destination, interests, 150 );
      const timeoutPromise = new Promise( ( _, reject ) =>
        setTimeout( () => reject( new Error( 'OSM timeout' ) ), API_TIMEOUT )
      );

      const osmPlaces = await Promise.race( [ osmPromise, timeoutPromise ] );

      if ( osmPlaces.length > 0 )
      {
        allPlaces = [ ...allPlaces, ...osmPlaces ];
        console.log( `✅ OSM: Got ${ osmPlaces.length } places from OpenStreetMap` );
      }
    } catch ( osmError )
    {
      console.warn( `⚠️ OpenStreetMap failed or timed out:`, osmError.message );
    }

    // SMART FILTERING: Remove ONLY obvious junk (memorials, monuments) but KEEP cafes, restaurants, local gems
    const originalCount = allPlaces.length;
    allPlaces = allPlaces.filter( place =>
    {
      const name = place.name.toLowerCase();
      const description = ( place.description || '' ).toLowerCase();
      const combined = name + ' ' + description;

      // ONLY filter out obvious junk - memorials, monuments, military stuff
      const junkKeywords = [
        'memorial', 'monument', 'statue of', 'plaque', 'bust of',
        'war memorial', 'battle of', 'regiment memorial', 'military memorial',
        'cavalry memorial', 'tank memorial', 'air force memorial'
      ];

      // Check if it's obvious junk
      const isObviousJunk = junkKeywords.some( keyword => combined.includes( keyword ) );

      // KEEP everything else - cafes, restaurants, parks, museums, local gems, etc.
      return !isObviousJunk;
    } );

    console.log( `🧹 FILTERED: Removed ${ originalCount - allPlaces.length } junk places (memorials/monuments), ${ allPlaces.length } quality places remaining` );

    // FALLBACK: Database places ONLY if APIs return very few results
    if ( allPlaces.length < 20 )
    {
      console.log( `📚 FALLBACK: Adding database places (APIs returned only ${ allPlaces.length } places)...` );
      try
      {
        const dbPlaces = getRealPlacesForDestination( destination, interests, 200 );
        if ( dbPlaces.length > 0 )
        {
          allPlaces = [ ...allPlaces, ...dbPlaces ];
          console.log( `✅ Added ${ dbPlaces.length } places from database` );
        }
      } catch ( dbError )
      {
        console.error( `❌ Database failed:`, dbError.message );
      }
    }

    // Remove duplicates
    const uniquePlaces = this.removeDuplicatePlaces( allPlaces );
    console.log( `✅ FINAL: Returning ${ uniquePlaces.length } UNIQUE places (from ${ allPlaces.length } total)` );

    if ( uniquePlaces.length === 0 )
    {
      console.error( `❌ NO PLACES FOUND for ${ destination }!` );
    }

    // Persistence: Save newly discovered places to MongoDB for future use
    try
    {
      // We pass destination as city. country might be harder to determine perfectly here
      // but placePersistenceService handles Unknowns.
      placePersistenceService.upsertPlaces( uniquePlaces, destination );
    } catch ( persistError )
    {
      console.warn( 'Silent failure persisting places:', persistError.message );
    }

    return uniquePlaces;
  }


  enhancePlaces ( places )
  {
    return places.map( place => ( {
      ...place,
      source: googlePlacesUsed && place.photos ? 'google_api' : 'curated_database',
      enhanced_description: this.enhanceDescription( place, destination ),
      visit_duration: this.estimateVisitDuration( place.category ),
      best_time_to_visit: this.getBestTimeToVisit( place.category ),
      accessibility: this.getAccessibilityInfo( place.category ),
      nearby_amenities: this.getNearbyAmenities( place.category )
    } ) );
  }

  async searchPlacesByType ( coordinates, type, radius )
  {
    const response = await axios.get( `${ this.baseGoogleUrl }/place/nearbysearch/json`, {
      params: {
        location: `${ coordinates.lat },${ coordinates.lng }`,
        radius: radius,
        type: type,
        key: this.googleMapsKey
      }
    } );

    return response.data.results.map( place => ( {
      place_id: place.place_id,
      name: place.name,
      types: place.types,
      rating: place.rating || 0,
      user_ratings_total: place.user_ratings_total || 0,
      price_level: place.price_level,
      location: place.geometry.location,
      vicinity: place.vicinity,
      photos: place.photos
    } ) );
  }

  async getPlaceDetails ( places )
  {
    const detailedPlaces = [];

    for ( const place of places )
    {
      try
      {
        const response = await axios.get( `${ this.baseGoogleUrl }/place/details/json`, {
          params: {
            place_id: place.place_id,
            fields: 'name,rating,formatted_phone_number,opening_hours,website,price_level,photos,geometry,types,reviews,formatted_address',
            key: this.googleMapsKey
          }
        } );

        const details = response.data.result;
        detailedPlaces.push( {
          place_id: place.place_id,
          name: details.name,
          category: this.mapGoogleTypesToCategories( details.types ),
          location: {
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng
          },
          rating: details.rating || 0,
          user_ratings_total: details.user_ratings_total || 0,
          opening_hours: this.parseOpeningHours( details.opening_hours ),
          entry_fee: this.estimateEntryFee( details.price_level, details.types ),
          phone: details.formatted_phone_number,
          website: details.website,
          address: details.formatted_address,
          tags: this.generateTags( details.types, details.rating ),
          description: this.generateDescription( details.name, details.types, details.rating ),
          photos: details.photos ? details.photos.slice( 0, 3 ).map( photo =>
            `${ this.baseGoogleUrl }/place/photo?maxwidth=400&photoreference=${ photo.photo_reference }&key=${ this.googleMapsKey }`
          ) : [],
          reviews: details.reviews ? details.reviews.slice( 0, 3 ).map( review => ( {
            author: review.author_name,
            rating: review.rating,
            text: review.text.substring( 0, 200 ) + '...',
            time: review.relative_time_description
          } ) ) : []
        } );

        // Add small delay to avoid rate limiting
        await new Promise( resolve => setTimeout( resolve, 100 ) );
      } catch ( error )
      {
        logger.warn( `Failed to get details for ${ place.name }:`, error.message );
      }
    }

    return detailedPlaces;
  }

  async getWeatherForecast ( destination, days )
  {
    console.log( `🌤️ Getting weather forecast for ${ destination } (${ days } days)` );

    // Try real weather API if we have a valid key
    if ( this.hasValidWeatherKey )
    {
      try
      {
        console.log( `🔑 Using OpenWeather API...` );
        const coordinates = await this.getDestinationCoordinates( destination );

        const response = await axios.get( `${ this.weatherUrl }/forecast`, {
          params: {
            lat: coordinates.lat,
            lon: coordinates.lng,
            appid: this.weatherKey,
            units: 'metric',
            cnt: days * 8 // 8 forecasts per day (every 3 hours)
          }
        } );

        // Group by day and get daily summary
        const dailyWeather = [];
        const forecasts = response.data.list;

        for ( let day = 0; day < days; day++ )
        {
          const dayForecasts = forecasts.slice( day * 8, ( day + 1 ) * 8 );
          if ( dayForecasts.length > 0 )
          {
            const dayWeather = this.summarizeDayWeather( dayForecasts, day + 1 );
            dailyWeather.push( dayWeather );
          }
        }

        console.log( `✅ Real weather data retrieved for ${ days } days` );
        return dailyWeather;
      } catch ( error )
      {
        console.warn( `⚠️ OpenWeather API failed:`, error.message );
      }
    } else
    {
      console.log( `⚠️ No valid OpenWeather API key found` );
    }

    // Generate realistic weather based on destination and season
    console.log( `🌦️ Generating realistic weather forecast...` );
    return this.generateRealisticWeather( destination, days );
  }

  generateRealisticWeather ( destination, days )
  {
    const currentMonth = new Date().getMonth(); // 0-11
    const destLower = destination.toLowerCase();

    // Climate data for different regions
    const climateData = {
      // Tropical (hot, humid, rainy season)
      tropical: {
        temp: [ 26, 32 ], conditions: [ 'sunny', 'partly_cloudy', 'thunderstorm' ],
        rainChance: 0.4, description: 'Tropical climate with afternoon showers'
      },
      // Mediterranean (mild winters, hot summers)
      mediterranean: {
        temp: currentMonth >= 5 && currentMonth <= 8 ? [ 22, 30 ] : [ 12, 18 ],
        conditions: currentMonth >= 5 && currentMonth <= 8 ? [ 'sunny', 'clear' ] : [ 'partly_cloudy', 'rain' ],
        rainChance: currentMonth >= 5 && currentMonth <= 8 ? 0.1 : 0.3,
        description: 'Mediterranean climate'
      },
      // Continental (cold winters, warm summers)
      continental: {
        temp: currentMonth >= 5 && currentMonth <= 8 ? [ 18, 28 ] : [ -5, 8 ],
        conditions: currentMonth >= 5 && currentMonth <= 8 ? [ 'sunny', 'partly_cloudy' ] : [ 'snow', 'cloudy' ],
        rainChance: 0.3,
        description: 'Continental climate with seasonal variations'
      },
      // Desert (hot days, cool nights, very dry)
      desert: {
        temp: [ 20, 35 ], conditions: [ 'sunny', 'clear' ],
        rainChance: 0.05, description: 'Desert climate - hot and dry'
      },
      // Oceanic (mild, wet)
      oceanic: {
        temp: [ 10, 20 ], conditions: [ 'cloudy', 'rain', 'partly_cloudy' ],
        rainChance: 0.5, description: 'Oceanic climate with frequent rain'
      }
    };

    // Map destinations to climate types
    let climate = climateData.oceanic; // default

    if ( destLower.includes( 'dubai' ) || destLower.includes( 'cairo' ) || destLower.includes( 'egypt' ) )
    {
      climate = climateData.desert;
    } else if ( destLower.includes( 'paris' ) || destLower.includes( 'rome' ) || destLower.includes( 'madrid' ) )
    {
      climate = climateData.mediterranean;
    } else if ( destLower.includes( 'london' ) || destLower.includes( 'amsterdam' ) || destLower.includes( 'dublin' ) )
    {
      climate = climateData.oceanic;
    } else if ( destLower.includes( 'moscow' ) || destLower.includes( 'berlin' ) || destLower.includes( 'warsaw' ) )
    {
      climate = climateData.continental;
    } else if ( destLower.includes( 'mumbai' ) || destLower.includes( 'bangkok' ) || destLower.includes( 'singapore' ) )
    {
      climate = climateData.tropical;
    } else if ( destLower.includes( 'new york' ) || destLower.includes( 'chicago' ) || destLower.includes( 'toronto' ) )
    {
      climate = climateData.continental;
    } else if ( destLower.includes( 'los angeles' ) || destLower.includes( 'sydney' ) || destLower.includes( 'barcelona' ) )
    {
      climate = climateData.mediterranean;
    }

    const forecast = [];
    for ( let day = 1; day <= days; day++ )
    {
      const isRainy = Math.random() < climate.rainChance;
      const condition = isRainy ? 'rain' : climate.conditions[ Math.floor( Math.random() * climate.conditions.length ) ];
      const baseTemp = climate.temp[ 0 ] + Math.random() * ( climate.temp[ 1 ] - climate.temp[ 0 ] );
      const tempVariation = ( Math.random() - 0.5 ) * 6; // ±3°C variation
      const temperature = Math.round( baseTemp + tempVariation );

      forecast.push( {
        day,
        condition,
        temperature,
        min_temp: temperature - 5,
        max_temp: temperature + 5,
        precipitation: isRainy ? Math.round( Math.random() * 10 + 2 ) : 0,
        description: `${ climate.description } - ${ this.getConditionDescription( condition ) }`,
        is_bad_weather: this.isBadWeather( condition, isRainy ? 6 : 0, temperature + 5, temperature - 5 ),
        humidity: Math.round( 40 + Math.random() * 40 ), // 40-80%
        wind_speed: Math.round( 5 + Math.random() * 15 ), // 5-20 km/h
        uv_index: condition === 'sunny' ? Math.round( 6 + Math.random() * 4 ) : Math.round( 2 + Math.random() * 4 )
      } );
    }

    return forecast;
  }

  getConditionDescription ( condition )
  {
    const descriptions = {
      'sunny': 'Clear sunny skies',
      'clear': 'Clear weather',
      'partly_cloudy': 'Partly cloudy with some sun',
      'cloudy': 'Overcast skies',
      'rain': 'Rain showers expected',
      'thunderstorm': 'Thunderstorms possible',
      'snow': 'Snow expected',
      'drizzle': 'Light drizzle'
    };
    return descriptions[ condition ] || 'Variable conditions';
  }

  summarizeDayWeather ( forecasts, day )
  {
    const temps = forecasts.map( f => f.main.temp );
    const conditions = forecasts.map( f => f.weather[ 0 ].main.toLowerCase() );
    const precipitation = forecasts.reduce( ( sum, f ) => sum + ( f.rain?.[ '3h' ] || 0 ), 0 );

    // Determine dominant condition
    const conditionCounts = {};
    conditions.forEach( condition =>
    {
      conditionCounts[ condition ] = ( conditionCounts[ condition ] || 0 ) + 1;
    } );
    const dominantCondition = Object.keys( conditionCounts ).reduce( ( a, b ) =>
      conditionCounts[ a ] > conditionCounts[ b ] ? a : b
    );

    return {
      day,
      condition: dominantCondition,
      temperature: Math.round( temps.reduce( ( sum, temp ) => sum + temp, 0 ) / temps.length ),
      min_temp: Math.round( Math.min( ...temps ) ),
      max_temp: Math.round( Math.max( ...temps ) ),
      precipitation: Math.round( precipitation * 10 ) / 10,
      description: forecasts[ 4 ]?.weather[ 0 ]?.description || 'No description',
      is_bad_weather: this.isBadWeather( dominantCondition, precipitation, Math.max( ...temps ), Math.min( ...temps ) )
    };
  }

  isBadWeather ( condition, precipitation, maxTemp, minTemp )
  {
    const badConditions = [ 'rain', 'thunderstorm', 'snow', 'drizzle' ];
    return badConditions.includes( condition ) ||
      precipitation > 5 ||
      maxTemp > 35 ||
      minTemp < 0;
  }

  mapInterestsToGoogleTypes ( interests )
  {
    const mapping = {
      'art': [ 'art_gallery', 'museum' ],
      'culture': [ 'museum', 'art_gallery', 'cultural_center' ],
      'history': [ 'museum', 'historical_site' ],
      'food': [ 'restaurant', 'food', 'meal_takeaway' ],
      'nature': [ 'park', 'natural_feature' ],
      'entertainment': [ 'amusement_park', 'movie_theater', 'night_club' ],
      'shopping': [ 'shopping_mall', 'store' ],
      'architecture': [ 'church', 'mosque', 'synagogue', 'hindu_temple' ],
      'nightlife': [ 'bar', 'night_club' ],
      'religious': [ 'church', 'mosque', 'synagogue', 'hindu_temple' ]
    };

    const types = new Set( [ 'tourist_attraction' ] ); // Always include tourist attractions
    interests.forEach( interest =>
    {
      const googleTypes = mapping[ interest.toLowerCase() ] || [];
      googleTypes.forEach( type => types.add( type ) );
    } );

    return Array.from( types );
  }

  mapGoogleTypesToCategories ( googleTypes )
  {
    const mapping = {
      'tourist_attraction': 'tourist_attraction',
      'museum': 'museum',
      'art_gallery': 'art_gallery',
      'restaurant': 'restaurant',
      'food': 'restaurant',
      'park': 'park',
      'church': 'church',
      'mosque': 'mosque',
      'synagogue': 'synagogue',
      'hindu_temple': 'temple',
      'shopping_mall': 'shopping',
      'store': 'shopping',
      'bar': 'bar',
      'night_club': 'nightclub'
    };

    const categories = [];
    googleTypes.forEach( type =>
    {
      if ( mapping[ type ] )
      {
        categories.push( mapping[ type ] );
      }
    } );

    return categories.length > 0 ? categories : [ 'tourist_attraction' ];
  }

  parseOpeningHours ( openingHours )
  {
    if ( !openingHours || !openingHours.periods )
    {
      return {};
    }

    const days = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ];
    const hours = {};

    openingHours.periods.forEach( period =>
    {
      const day = days[ period.open.day ];
      hours[ day ] = {
        open: period.open.time,
        close: period.close?.time || '2359'
      };
    } );

    return hours;
  }

  estimateEntryFee ( priceLevel, types )
  {
    if ( types.includes( 'park' ) || types.includes( 'church' ) ) return 0;

    const priceLevels = {
      0: 0,    // Free
      1: 10,   // Inexpensive
      2: 25,   // Moderate
      3: 50,   // Expensive
      4: 100   // Very Expensive
    };

    return priceLevels[ priceLevel ] || 15; // Default moderate price
  }

  generateTags ( types, rating )
  {
    const tags = [ ...types ];
    if ( rating >= 4.5 ) tags.push( 'highly_rated' );
    if ( rating >= 4.0 ) tags.push( 'popular' );
    return tags;
  }

  generateDescription ( name, types, rating )
  {
    const typeDescriptions = {
      'tourist_attraction': 'popular tourist destination',
      'museum': 'cultural museum',
      'restaurant': 'dining establishment',
      'park': 'recreational park',
      'church': 'historic church'
    };

    const primaryType = types[ 0 ] || 'tourist_attraction';
    const description = typeDescriptions[ primaryType ] || 'interesting place';
    const ratingText = rating >= 4.5 ? 'highly rated' : rating >= 4.0 ? 'well-reviewed' : '';

    return `${ name } is a ${ ratingText } ${ description }${ rating ? ` with ${ rating }/5 stars` : '' }.`;
  }

  removeDuplicatePlaces ( places )
  {
    const seen = new Set();
    return places.filter( place =>
    {
      const key = `${ place.name }_${ place.location.lat }_${ place.location.lng }`;
      if ( seen.has( key ) ) return false;
      seen.add( key );
      return true;
    } );
  }

  enhanceDescription ( place, destination )
  {
    const baseDesc = place.description || `Interesting place in ${ destination }`;
    const enhancements = [];

    if ( place.rating >= 4.5 ) enhancements.push( "Highly rated by visitors" );
    if ( place.tags?.includes( 'unesco' ) ) enhancements.push( "UNESCO World Heritage Site" );
    if ( place.tags?.includes( 'free' ) || place.entry_fee === 0 ) enhancements.push( "Free admission" );
    if ( place.tags?.includes( 'iconic' ) ) enhancements.push( "Iconic landmark" );

    return enhancements.length > 0 ?
      `${ baseDesc } ${ enhancements.join( '. ' ) }.` :
      baseDesc;
  }

  estimateVisitDuration ( categories )
  {
    const durations = {
      'museum': '2-3 hours',
      'park': '1-2 hours',
      'church': '30-60 minutes',
      'temple': '30-60 minutes',
      'monument': '30-45 minutes',
      'shopping_mall': '2-4 hours',
      'restaurant': '1-2 hours',
      'beach': '2-4 hours',
      'observation_deck': '1-2 hours'
    };

    for ( const category of categories )
    {
      if ( durations[ category ] ) return durations[ category ];
    }
    return '1-2 hours';
  }

  getBestTimeToVisit ( categories )
  {
    const times = {
      'museum': 'Morning (less crowded)',
      'park': 'Early morning or late afternoon',
      'church': 'Morning or early evening',
      'temple': 'Early morning',
      'monument': 'Golden hour (sunrise/sunset)',
      'shopping_mall': 'Afternoon',
      'restaurant': 'Lunch or dinner time',
      'beach': 'Morning or late afternoon',
      'observation_deck': 'Sunset for best views'
    };

    for ( const category of categories )
    {
      if ( times[ category ] ) return times[ category ];
    }
    return 'Anytime during opening hours';
  }

  getAccessibilityInfo ( categories )
  {
    const accessibility = {
      'museum': 'Usually wheelchair accessible',
      'park': 'Mostly accessible paths',
      'church': 'May have steps, check accessibility',
      'temple': 'May have steps, check accessibility',
      'monument': 'Outdoor, generally accessible',
      'shopping_mall': 'Fully wheelchair accessible',
      'restaurant': 'Usually accessible',
      'beach': 'Beach wheelchair access varies',
      'observation_deck': 'Elevator access available'
    };

    for ( const category of categories )
    {
      if ( accessibility[ category ] ) return accessibility[ category ];
    }
    return 'Contact venue for accessibility information';
  }

  getNearbyAmenities ( categories )
  {
    const amenities = {
      'museum': [ 'Gift shop', 'Cafe', 'Restrooms', 'Audio guides' ],
      'park': [ 'Restrooms', 'Benches', 'Walking paths', 'Playgrounds' ],
      'church': [ 'Visitor center', 'Guided tours', 'Gift shop' ],
      'temple': [ 'Visitor information', 'Prayer areas', 'Gardens' ],
      'monument': [ 'Information boards', 'Photo opportunities', 'Nearby cafes' ],
      'shopping_mall': [ 'Restaurants', 'Parking', 'ATMs', 'Entertainment' ],
      'restaurant': [ 'Parking', 'Takeaway', 'Reservations' ],
      'beach': [ 'Lifeguards', 'Beach facilities', 'Nearby restaurants' ],
      'observation_deck': [ 'Elevators', 'Gift shop', 'Cafe', 'Telescopes' ]
    };

    for ( const category of categories )
    {
      if ( amenities[ category ] ) return amenities[ category ];
    }
    return [ 'Basic facilities available' ];
  }

  // Convert country names to specific cities for better results
  getSpecificLocation ( destination )
  {
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
      'mexico': 'Mexico City, Mexico',
      'egypt': 'Cairo, Egypt',
      'greece': 'Athens, Greece',
      'turkey': 'Istanbul, Turkey',
      'russia': 'Moscow, Russia',
      'portugal': 'Lisbon, Portugal',
      'netherlands': 'Amsterdam, Netherlands',
      'belgium': 'Brussels, Belgium',
      'switzerland': 'Zurich, Switzerland',
      'austria': 'Vienna, Austria'
    };

    const lowerDest = destination.toLowerCase().trim();
    return countryToCityMap[ lowerDest ] || destination;
  }
}

module.exports = new RealDataService();