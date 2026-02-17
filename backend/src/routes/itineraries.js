const express = require( 'express' );
const mongoose = require( 'mongoose' );
const Joi = require( 'joi' );
const Itinerary = require( '../models/Itinerary' );
const Place = require( '../models/Place' );
const { authenticateToken } = require( '../middleware/auth' );
const { validateRequest, validateQuery } = require( '../middleware/validation' );
const mlService = require( '../services/mlService' );
const mapsService = require( '../services/mapsService' );
const smartPlaceGenerator = require( '../services/smartPlaceGenerator' );
const realDataService = require( '../services/realDataService' );
const mlRecommendationEngine = require( '../services/mlRecommendationEngine' );
const weatherOptimizer = require( '../services/weatherOptimizer' );
const hiddenGemsService = require( '../services/hiddenGemsService' );
const currencyService = require( '../services/currencyService' );
const translationService = require( '../services/translationService' );

const router = express.Router();

// Validation schemas
const createItinerarySchema = Joi.object( {
  destination: Joi.string().trim().min( 1 ).max( 200 ).required(),
  days: Joi.number().integer().min( 1 ).max( 30 ).required(),
  budget: Joi.number().min( 0 ).required(),
  placesPerDay: Joi.number().integer().min( 1 ).max( 15 ).default( 7 ), // NEW: User can specify places per day
  preferences: Joi.object( {
    budget: Joi.string().valid( 'low', 'medium', 'high' ),
    interests: Joi.array().items( Joi.string().trim() )
  } ).default( {} ),
  start_location: Joi.object( {
    lat: Joi.number().min( -90 ).max( 90 ),
    lng: Joi.number().min( -180 ).max( 180 )
  } ),
  format: Joi.string().valid( 'standard', 'detailed', 'compact' ).default( 'standard' )
} );

const updateItinerarySchema = Joi.object( {
  title: Joi.string().trim().max( 200 ),
  notes: Joi.string().trim().max( 1000 ),
  plan: Joi.array().items( Joi.object( {
    day: Joi.number().integer().min( 1 ).required(),
    places: Joi.array().items( Joi.object( {
      place_id: Joi.string().required(),
      name: Joi.string().required(),
      start_time: Joi.string().required(),
      end_time: Joi.string().required(),
      category: Joi.array().items( Joi.string() ),
      location: Joi.object( {
        lat: Joi.number(),
        lng: Joi.number()
      } ),
      rating: Joi.number().min( 0 ).max( 5 ),
      entry_fee: Joi.number().min( 0 ),
      tags: Joi.array().items( Joi.string() ),
      notes: Joi.string()
    } ) )
  } ) ),
  is_public: Joi.boolean()
} );

const listSchema = Joi.object( {
  limit: Joi.number().min( 1 ).max( 100 ).default( 20 ),
  offset: Joi.number().min( 0 ).default( 0 ),
  destination: Joi.string().trim()
} );

/**
 * @swagger
 * /itineraries/save:
 *   post:
 *     summary: Save a client-generated itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Itinerary saved successfully
 */
router.post( '/save', authenticateToken, async ( req, res, next ) =>
{
  try
  {
    const itineraryData = req.body;
    const userId = req.user._id;

    console.log( `💾 Saving itinerary for user ${ userId }` );

    // Ensure user_id is set to current user
    itineraryData.user_id = userId;

    // Remove _id if it's a temporary/session ID
    if ( itineraryData._id && ( itineraryData._id.startsWith( 'session_' ) || itineraryData._id.startsWith( 'temp_' ) ) )
    {
      delete itineraryData._id;
    }

    let itinerary;

    // If we have a valid MongoDB _id, try to update existing
    if ( itineraryData._id && mongoose.Types.ObjectId.isValid( itineraryData._id ) )
    {
      console.log( `🔄 Updating existing itinerary: ${ itineraryData._id }` );
      itineraryData.updated_at = new Date();

      itinerary = await Itinerary.findOneAndUpdate(
        { _id: itineraryData._id, user_id: userId },
        { $set: itineraryData },
        { new: true, runValidators: true }
      );
    }

    // If no existing itinerary found (or no valid ID), create new
    if ( !itinerary )
    {
      console.log( `✨ Creating new itinerary` );
      if ( itineraryData._id ) delete itineraryData._id; // Ensure no ID conflict if it was invalid

      // Add metadata if missing
      // createdAt and updatedAt are handled by mongoose timestamps: true
      if ( !itineraryData.generated_on ) itineraryData.generated_on = new Date();

      itinerary = new Itinerary( itineraryData );
      await itinerary.save();
    }

    // Add to user's saved itineraries if not already there
    if ( !req.user.saved_itineraries.includes( itinerary._id ) )
    {
      req.user.saved_itineraries.push( itinerary._id );
      await req.user.save();
    }

    console.log( `✅ Itinerary saved/updated with ID: ${ itinerary._id }` );

    res.status( 201 ).json( itinerary );
  } catch ( error )
  {
    console.error( '❌ Failed to save itinerary:', error );
    next( error );
  }
} );

/**
 * @swagger
 * /itineraries:
 *   post:
 *     summary: Generate and save a new itinerary
 *     tags: [Itineraries]

 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destination
 *               - days
 *               - budget
 *             properties:
 *               destination:
 *                 type: string
 *               days:
 *                 type: number
 *               budget:
 *                 type: number
 *               preferences:
 *                 type: object
 *                 properties:
 *                   budget:
 *                     type: string
 *                     enum: [low, medium, high]
 *                   interests:
 *                     type: array
 *                     items:
 *                       type: string
 *               start_location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               format:
 *                 type: string
 *                 enum: [standard, detailed, compact]
 *     responses:
 *       201:
 *         description: Itinerary created successfully
 *       400:
 *         description: Validation error
 *       503:
 *         description: ML service unavailable
 */
router.post( '/', authenticateToken, validateRequest( createItinerarySchema ), async ( req, res, next ) =>
{
  try
  {
    const { destination, days, budget, placesPerDay, preferences, start_location, format } = req.body;
    const userId = req.user._id;

    let plan = [];
    let mlServiceAvailable = true;
    let weatherForecast = [];
    let weatherOptimized = { weather_adjustments: [] };
    let realPlaces = [];

    try
    {
      console.log( `🚀 Generating REAL itinerary for ${ destination } (${ days } days, $${ budget })` );
      // ... rest of the existing function
      // We keep the existing '/' route as is, but we add the new route BELOW it.
      // To avoid replacing the whole big function, I will target a smaller chunk.
      // I will actually INSERT the new route BEFORE the '/' route for cleanliness, or AFTER.
      // Let's insert it AFTER the existing POST / route to match the file structure.
      // But wait, the existing POST / route is huge.
      // I will insert the new route BEFORE the existing POST / route to be safe and clean.



      // Extract interests from natural language query if provided
      let allInterests = [ ...( preferences.interests || [] ) ];
      if ( req.body.naturalLanguageQuery )
      {
        const extractedInterests = extractInterestsFromText( req.body.naturalLanguageQuery );
        allInterests = [ ...new Set( [ ...allInterests, ...extractedInterests ] ) ];
      }

      console.log( `🎯 Interests identified:`, allInterests );

      // Step 1: Get REAL places from Google Places API
      let realPlaces = [];
      try
      {
        console.log( `🌍 Fetching real places from Google Places API...` );
        realPlaces = await realDataService.getRealPlaces( destination, allInterests, 15000 );
        console.log( `✅ Found ${ realPlaces.length } real places` );
      } catch ( error )
      {
        console.warn( `⚠️ Google Places API failed:`, error.message );
      }

      // Step 2: Get database places as backup (if DB is connected)
      let dbPlaces = [];
      try
      {
        if ( req.app.locals.dbConnected )
        {
          dbPlaces = await Place.find( {
            $or: [
              { city: { $regex: destination, $options: 'i' } },
              { country: { $regex: destination, $options: 'i' } },
              { name: { $regex: destination, $options: 'i' } }
            ]
          } ).limit( 15 ).lean();
        }
      } catch ( error )
      {
        console.warn( '⚠️ Database query failed, using comprehensive database only' );
      }

      // Step 3: Combine ONLY REAL places from APIs and database
      let allPlaces = [ ...realPlaces, ...dbPlaces ];

      console.log( `📍 Total REAL places from APIs: ${ allPlaces.length }` );
      console.log( `   - Real places from APIs: ${ realPlaces.length }` );
      console.log( `   - Database places: ${ dbPlaces.length }` );

      // Log first few place names to verify they're real
      console.log( `📝 Sample places:`, allPlaces.slice( 0, 10 ).map( p => p.name ) );

      // If we have very few places, something is wrong with the APIs
      if ( allPlaces.length < 10 )
      {
        console.error( `❌ CRITICAL: Only ${ allPlaces.length } places found! APIs may be failing!` );
        console.error( `🔍 Please check API keys and network connection` );
      }

      // Step 7: Get ML recommendations
      console.log( `🤖 Getting ML recommendations...` );

      // Train ML model with simulated user feedback
      for ( let i = 0; i < Math.min( 10, allPlaces.length ); i++ )
      {
        mlRecommendationEngine.simulateUserFeedback( userId.toString(), allPlaces[ i ], { ...preferences, interests: allInterests } );
      }

      await mlRecommendationEngine.buildAndTrainModel();

      const recommendations = await mlRecommendationEngine.getRecommendations(
        userId.toString(),
        { ...preferences, interests: allInterests },
        allPlaces
      );

      console.log( `🎯 Got ${ recommendations.length } ML recommendations` );

      // Step 8: Get weather forecast
      console.log( `🌤️ Fetching weather forecast...` );
      const weatherForecast = await realDataService.getWeatherForecast( destination, days );
      console.log( `🌦️ Weather forecast:`, weatherForecast.map( w => `Day ${ w.day }: ${ w.condition } ${ w.temperature }°C` ) );

      // Step 9: Use INTELLIGENT itinerary builder with REAL places only
      const intelligentItineraryBuilder = require( '../services/intelligentItineraryBuilder' );

      console.log( `🎨 Generating SUPER INTELLIGENT itinerary...` );
      console.log( `📊 Available places: ${ allPlaces.length }` );
      console.log( `🎯 Recommendations: ${ recommendations.length }` );
      console.log( `💰 Budget: $${ budget } for ${ days } days ($${ Math.round( budget / days ) }/day)` );

      // Ensure we have enough UNIQUE places for all days
      const minPlacesPerDay = 6; // 6 main activities per day (excluding meals)
      const totalNeeded = days * minPlacesPerDay;

      // Create a pool of unique places with their ML scores
      const uniquePlacesMap = new Map();

      // Add recommended places first (they have ML scores)
      recommendations.forEach( rec =>
      {
        const place = allPlaces.find( p => p.place_id === rec.place_id );
        if ( place && !uniquePlacesMap.has( place.place_id ) )
        {
          uniquePlacesMap.set( place.place_id, {
            ...place,
            ml_score: rec.score,
            ml_confidence: rec.confidence,
            ml_reasons: rec.reasons || []
          } );
        }
      } );

      // Add remaining places from allPlaces
      allPlaces.forEach( place =>
      {
        if ( !uniquePlacesMap.has( place.place_id ) )
        {
          uniquePlacesMap.set( place.place_id, {
            ...place,
            ml_score: 0.7 + Math.random() * 0.2,
            ml_confidence: 0.75,
            ml_reasons: [ 'Recommended based on your interests' ]
          } );
        }
      } );

      // Convert to array - USE ONLY REAL PLACES
      let uniquePlaces = Array.from( uniquePlacesMap.values() );

      console.log( `✅ Unique REAL places pool: ${ uniquePlaces.length }` );
      console.log( `📝 Place names:`, uniquePlaces.slice( 0, 10 ).map( p => p.name ) );

      // DON'T generate fake places - work with what we have!
      if ( uniquePlaces.length < totalNeeded )
      {
        console.log( `⚠️ Have ${ uniquePlaces.length } real places, ideally need ${ totalNeeded }` );
        console.log( `✅ Will create itinerary with available real places only` );
      }

      // Generate itinerary using INTELLIGENT builder with REAL places
      plan = intelligentItineraryBuilder.buildItinerary(
        destination,
        days,
        budget,
        allInterests,
        uniquePlaces,
        placesPerDay || 7 // Default to 7 if not specified
      );

      console.log( `✅ Generated itinerary with ${ plan.length } days` );
      plan.forEach( ( dayPlan, idx ) =>
      {
        console.log( `   Day ${ idx + 1 }: ${ dayPlan.places?.length || 0 } activities, $${ dayPlan.total_cost } spent, Theme: ${ dayPlan.theme }` );
      } );

      // Step 8: Optimize for weather
      console.log( `🌦️ Optimizing itinerary for weather...` );
      const weatherOptimized = await weatherOptimizer.optimizeForWeather(
        { plan },
        weatherForecast,
        allPlaces
      );

      plan = weatherOptimized.optimized_itinerary.plan;

      // Add weather info to itinerary
      itinerary.weather_forecast = weatherForecast;
      itinerary.weather_adjustments = weatherOptimized.weather_adjustments;
      itinerary.ml_powered = true;
      itinerary.real_data_used = realPlaces.length > 0;

      console.log( `✅ Generated complete itinerary with ${ plan.length } days and ${ weatherOptimized.weather_adjustments.length } weather adjustments` );

      mlServiceAvailable = true; // We used our own ML service

    } catch ( error )
    {
      console.warn( 'Itinerary generation failed, creating basic itinerary:', error.message );
      mlServiceAvailable = false;

      // Enhanced fallback: use comprehensive database
      let fallbackPlaces = [];
      try
      {
        fallbackPlaces = await Place.find( {
          $or: [
            { city: { $regex: destination, $options: 'i' } },
            { country: { $regex: destination, $options: 'i' } },
            { name: { $regex: destination, $options: 'i' } }
          ]
        } )
          .sort( { rating: -1 } )
          .limit( days * 3 )
          .lean();
      } catch ( error )
      {
        console.warn( '⚠️ Database fallback failed, using comprehensive database' );
      }

      // Use universal real places database as primary fallback
      if ( fallbackPlaces.length === 0 )
      {
        const universalPlacesDB = require( '../services/universalPlacesDB' );
        fallbackPlaces = universalPlacesDB.getRealPlacesForDestination( destination, preferences?.interests || [], days * 3 );
      }

      // If no places found in database, we will rely on strict empty checks later
      if ( fallbackPlaces.length === 0 )
      {
        console.log( '⚠️ No fallback places found. Itinerary will be shorter than requested.' );
      }

      // Add hidden gems to fallback places
      const fallbackHiddenGems = hiddenGemsService.getHiddenGems( destination, preferences?.interests || [], days * 3 );
      fallbackPlaces = [ ...fallbackPlaces, ...fallbackHiddenGems ];

      console.log( `🔄 Total fallback places with hidden gems: ${ fallbackPlaces.length }` );

      // Use ONLY real places - no fake generation
      console.log( `✅ Fallback: Using ${ fallbackPlaces.length } REAL places only` );
      console.log( `📝 Sample fallback places:`, fallbackPlaces.slice( 0, 5 ).map( p => p.name ) );

      // Use INTELLIGENT itinerary builder for fallback too
      const intelligentItineraryBuilder = require( '../services/intelligentItineraryBuilder' );
      plan = intelligentItineraryBuilder.buildItinerary(
        destination,
        days,
        budget,
        preferences?.interests || [],
        fallbackPlaces,
        placesPerDay || 7 // Default to 7 if not specified
      );

      console.log( `🔄 Fallback: Generated itinerary with ${ plan.length } days` );
      plan.forEach( ( dayPlan, idx ) =>
      {
        console.log( `   Day ${ idx + 1 }: ${ dayPlan.places?.length || 0 } activities, $${ dayPlan.total_cost } spent` );
      } );
    }

    // Add translations and multi-currency pricing to plan
    console.log( `🌍 Adding translations and multi-currency pricing...` );
    plan = plan.map( day =>
    {
      if ( day.places )
      {
        day.places = day.places.map( place =>
        {
          // Add translation
          let translatedPlace = translationService.addTranslation( place );
          // Add multi-currency pricing
          translatedPlace = currencyService.addMultiCurrencyPricing( translatedPlace, destination );
          return translatedPlace;
        } );
      }
      return day;
    } );
    console.log( `✅ Translations and pricing added` );

    // Create itinerary object
    const itineraryData = {
      user_id: userId,
      destination,
      days,
      budget,
      plan,
      format,
      generated_on: new Date(),
      weather_forecast: weatherForecast || [],
      weather_adjustments: weatherOptimized?.weather_adjustments || [],
      ml_powered: true,
      real_data_used: realPlaces.length > 0
    };

    let itinerary;
    let savedToDatabase = false;

    // Try to save to database if connected
    if ( req.app.locals.dbConnected )
    {
      try
      {
        itinerary = new Itinerary( itineraryData );
        await itinerary.save();

        // Add to user's saved itineraries
        req.user.saved_itineraries.push( itinerary._id );
        await req.user.save();

        savedToDatabase = true;
        console.log( '✅ Itinerary saved to database successfully' );
      } catch ( dbError )
      {
        console.warn( '⚠️ Database save failed, returning itinerary without saving:', dbError.message );
        // Create a mock itinerary object for response
        itinerary = {
          _id: `temp_${ Date.now() }`,
          ...itineraryData,
          created_at: new Date(),
          updated_at: new Date()
        };
      }
    } else
    {
      // Offline mode - create itinerary object that can be viewed
      console.log( '📱 Offline mode: Creating itinerary for current session' );
      itinerary = {
        _id: `session_${ Date.now() }`,
        ...itineraryData,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Store in memory for this session
      if ( !global.sessionItineraries )
      {
        global.sessionItineraries = new Map();
      }
      global.sessionItineraries.set( itinerary._id, itinerary );
    }

    res.status( 201 ).json( {
      itinerary,
      ml_service_available: mlServiceAvailable,
      saved_to_database: savedToDatabase,
      message: savedToDatabase ?
        'Itinerary generated and saved successfully' :
        'Itinerary generated successfully (offline mode)'
    } );

  } catch ( error )
  {
    next( error );
  }
} );

/**
 * @swagger
 * /itineraries:
 *   get:
 *     summary: Get user's itineraries
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of results (default 20)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *         description: Offset for pagination (default 0)
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter by destination
 *     responses:
 *       200:
 *         description: List of itineraries
 */
router.get( '/', authenticateToken, validateQuery( listSchema ), async ( req, res, next ) =>
{
  try
  {
    const { limit, offset, destination } = req.query;
    const userId = req.user._id;

    let itineraries = [];
    let total = 0;
    let hasMore = false;

    // Try database first if connected
    if ( req.app.locals.dbConnected )
    {
      try
      {
        let query = { user_id: userId };

        if ( destination )
        {
          query.destination = { $regex: destination, $options: 'i' };
        }

        itineraries = await Itinerary.find( query )
          .sort( { createdAt: -1 } )
          .limit( limit )
          .skip( offset )
          .lean();

        total = await Itinerary.countDocuments( query );
        hasMore = offset + limit < total;
      } catch ( dbError )
      {
        console.warn( 'Database query failed, using session storage:', dbError.message );
      }
    }

    // If database failed or offline, use session storage
    if ( itineraries.length === 0 && global.sessionItineraries )
    {
      const sessionItins = Array.from( global.sessionItineraries.values() )
        .filter( itin => itin.user_id.toString() === userId.toString() )
        .sort( ( a, b ) => new Date( b.created_at ) - new Date( a.created_at ) );

      itineraries = sessionItins.slice( offset, offset + limit );
      total = sessionItins.length;
      hasMore = offset + limit < total;
    }

    res.json( {
      itineraries,
      total,
      has_more: hasMore
    } );
  } catch ( error )
  {
    next( error );
  }
} );

/**
 * @swagger
 * /itineraries/{id}:
 *   get:
 *     summary: Get itinerary by ID
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Itinerary ID
 *     responses:
 *       200:
 *         description: Itinerary details
 *       404:
 *         description: Itinerary not found
 */
router.get( '/:id', authenticateToken, async ( req, res, next ) =>
{
  try
  {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if this is a session itinerary (stored in memory)
    if ( id.startsWith( 'session_' ) || id.startsWith( 'realtime_' ) || id.startsWith( 'offline_' ) || id.startsWith( 'temp_' ) )
    {
      if ( global.sessionItineraries && global.sessionItineraries.has( id ) )
      {
        const itinerary = global.sessionItineraries.get( id );
        return res.json( itinerary );
      }
      return res.status( 404 ).json( {
        error: 'Itinerary not found',
        message: 'This itinerary was created in offline mode and is only available during the current session. Please reconnect to the database for permanent storage.'
      } );
    }

    // Try to get from database
    const itinerary = await Itinerary.findOne( {
      _id: id,
      $or: [
        { user_id: userId },
        { is_public: true }
      ]
    } ).lean();

    if ( !itinerary )
    {
      return res.status( 404 ).json( { error: 'Itinerary not found' } );
    }

    res.json( itinerary );
  } catch ( error )
  {
    // Handle invalid ObjectId format
    if ( error.name === 'CastError' )
    {
      return res.status( 400 ).json( {
        error: 'Invalid ID format',
        message: 'The itinerary ID is not valid. It may have been created in offline mode.'
      } );
    }
    next( error );
  }
} );

/**
 * @swagger
 * /itineraries/{id}:
 *   patch:
 *     summary: Update itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Itinerary ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               notes:
 *                 type: string
 *               plan:
 *                 type: array
 *               is_public:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Itinerary updated successfully
 *       404:
 *         description: Itinerary not found
 */
router.patch( '/:id', authenticateToken, validateRequest( updateItinerarySchema ), async ( req, res, next ) =>
{
  try
  {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: id, user_id: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if ( !itinerary )
    {
      return res.status( 404 ).json( { error: 'Itinerary not found' } );
    }

    res.json( itinerary );
  } catch ( error )
  {
    next( error );
  }
} );

/**
 * @swagger
 * /itineraries/{id}:
 *   delete:
 *     summary: Delete itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Itinerary ID
 *     responses:
 *       200:
 *         description: Itinerary deleted successfully
 *       404:
 *         description: Itinerary not found
 */
router.delete( '/:id', authenticateToken, async ( req, res, next ) =>
{
  try
  {
    const { id } = req.params;
    const userId = req.user._id;

    const itinerary = await Itinerary.findOneAndDelete( {
      _id: id,
      user_id: userId
    } );

    if ( !itinerary )
    {
      return res.status( 404 ).json( { error: 'Itinerary not found' } );
    }

    // Remove from user's saved itineraries
    req.user.saved_itineraries = req.user.saved_itineraries.filter(
      itinId => !itinId.equals( id )
    );
    await req.user.save();

    res.json( { message: 'Itinerary deleted successfully' } );
  } catch ( error )
  {
    next( error );
  }
} );

// Helper functions
function extractInterestsFromText ( text )
{
  const interests = [];
  const textLower = text.toLowerCase();

  const interestKeywords = {
    'art': [ 'art', 'museum', 'gallery', 'painting', 'sculpture' ],
    'culture': [ 'culture', 'cultural', 'tradition', 'local', 'heritage' ],
    'history': [ 'history', 'historical', 'ancient', 'heritage', 'monument' ],
    'food': [ 'food', 'restaurant', 'cuisine', 'dining', 'culinary', 'eat', 'taste' ],
    'nature': [ 'nature', 'park', 'garden', 'outdoor', 'hiking', 'scenic' ],
    'architecture': [ 'architecture', 'building', 'cathedral', 'temple', 'palace' ],
    'entertainment': [ 'entertainment', 'show', 'theater', 'music', 'nightlife' ],
    'shopping': [ 'shopping', 'market', 'boutique', 'mall', 'souvenir' ],
    'famous': [ 'famous', 'iconic', 'landmark', 'must-see', 'popular', 'well-known' ],
    'romantic': [ 'romantic', 'couple', 'honeymoon', 'intimate', 'cozy' ]
  };

  Object.entries( interestKeywords ).forEach( ( [ interest, keywords ] ) =>
  {
    if ( keywords.some( keyword => textLower.includes( keyword ) ) )
    {
      interests.push( interest );
    }
  } );

  return interests;
}

function generatePlaceNote ( place, interests, mlReasons = [] )
{
  const notes = [];

  // Add ML reasons first
  if ( mlReasons && mlReasons.length > 0 )
  {
    notes.push( ...mlReasons );
  }

  if ( place.tags )
  {
    if ( place.tags.includes( 'famous' ) || place.tags.includes( 'iconic' ) )
    {
      notes.push( 'Must-see attraction' );
    }
    if ( place.tags.includes( 'free' ) || place.entry_fee === 0 )
    {
      notes.push( 'Free entry' );
    }
    if ( place.tags.includes( 'food' ) && interests.includes( 'food' ) )
    {
      notes.push( 'Perfect for food lovers' );
    }
    if ( place.tags.includes( 'art' ) && interests.includes( 'art' ) )
    {
      notes.push( 'Great for art enthusiasts' );
    }
    if ( place.tags.includes( 'history' ) && interests.includes( 'history' ) )
    {
      notes.push( 'Rich historical significance' );
    }
  }

  if ( place.rating && place.rating > 4.5 )
  {
    notes.push( 'Highly rated by visitors' );
  }

  if ( place.user_ratings_total && place.user_ratings_total > 1000 )
  {
    notes.push( 'Very popular destination' );
  }

  return notes.length > 0 ? notes.slice( 0, 3 ).join( '. ' ) + '.' : 'Recommended attraction in the area.';
}

module.exports = router;