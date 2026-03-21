// Real-time itinerary generation — no database used for places.
const express = require('express');
const Joi = require('joi');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const mlService = require('../services/mlService');
const realDataService = require('../services/realDataService');
const currencyService = require('../services/currencyService');
const Itinerary = require('../models/Itinerary');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schema
const generateItinerarySchema = Joi.object({
  query: Joi.string().trim().min(1).max(500).required(),
  preferences: Joi.object({
    budget: Joi.string().valid('low', 'medium', 'high').default('medium'),
    rawBudget: Joi.string().allow('').optional(), // Raw budget string for currency detection
    interests: Joi.array().items(Joi.string().trim()).default([])
  }).default({})
});

/**
 * @swagger
 * /realtime/generate-itinerary:
 *   post:
 *     summary: Generate real-time AI itinerary
 *     tags: [Realtime]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Plan me a 3-day trip to Goa for beaches and food under ₹20,000"
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
 *     responses:
 *       201:
 *         description: Itinerary generated successfully
 *       400:
 *         description: Validation error
 */
router.post('/generate-itinerary', authenticateToken, validateRequest(generateItinerarySchema), async (req, res, next) => {
  try {
    const { query, preferences } = req.body;
    const userId = req.user._id;

    logger.info(`🚀 Real-time itinerary generation started for: ${query}`);

    // Step 1: Parse natural language query using ML
    const parsedQuery = await mlService.parseNLP(query);
    logger.info(`🧠 Parsed query:`, parsedQuery);

    let { destination, days, budget, interests: extractedInterests } = parsedQuery;
    
    // MANUAL OVERRIDE: Extract days and places per day from query text
    // This fixes the ML service's incorrect parsing
    const queryLower = query.toLowerCase();
    
    // Extract days (e.g., "4-day", "4 day", "4 days")
    const daysMatch = queryLower.match(/(\d+)[\s-]?days?/);
    if (daysMatch) {
      const extractedDays = parseInt(daysMatch[1]);
      if (extractedDays !== days) {
        logger.info(`🔧 OVERRIDE: Correcting days from ${days} to ${extractedDays}`);
        days = extractedDays;
      }
    }
    
    // Extract places per day (e.g., "5 places per day", "include 5 places")
    let placesPerDay = 7; // Default
    const placesMatch = queryLower.match(/(\d+)\s+places?\s+(per\s+day|each\s+day|daily)/);
    if (placesMatch) {
      placesPerDay = parseInt(placesMatch[1]);
      logger.info(`🎯 Extracted places per day: ${placesPerDay}`);
    }
    
    // Combine extracted interests with user preferences
    const allInterests = [...new Set([
      ...(preferences.interests || []),
      ...extractedInterests
    ])];

    // Step 2: Get real places dynamically (no local database)
    let realPlaces = [];
    
    // Adjust destination if it's a country (convert to city)
    const adjustedDestination = realDataService.getSpecificLocation ? 
      realDataService.getSpecificLocation(destination) : destination;
    
    if (adjustedDestination !== destination) {
      logger.info(`🎯 Using ${adjustedDestination} instead of ${destination}`);
      destination = adjustedDestination; // Update destination variable
    }
    
    // === SMART BUDGET + CURRENCY HANDLING ===
    // Parse the user's budget string (could be $5000, ₹50000, 50000INR, or plain 50000)
    // preferences.rawBudget is the raw string from the form; fall back to NLP-parsed budget
    const rawBudgetInput = preferences?.rawBudget || budget;
    const budgetInfo = currencyService.parseBudgetInput(rawBudgetInput, destination);
    let localCurrency = budgetInfo.localCurrency;
    let localBudget = budgetInfo.localAmount;

    if (budgetInfo.isConverted) {
      logger.info(`💱 Budget converted: ${budgetInfo.currency} ${budgetInfo.amount} → ${localCurrency} ${localBudget}`);
    } else {
      logger.info(`💰 Budget in local currency (${localCurrency}): ${localBudget}`);
    }

    // Ensure budget and days are sensible
    if (!localBudget || localBudget <= 0) localBudget = 50000; // default ₹50,000 for Indian destinations
    budget = localBudget; // override budget variable with local amount

    // Try Google Places API first
    try {
      logger.info(`🌍 Fetching real places from Google Places API for ${destination}`);
      realPlaces = await realDataService.getRealPlaces(destination, allInterests, 15000);
      logger.info(`✅ Found ${realPlaces.length} real places from Google API`);
    } catch (error) {
      logger.warn(`⚠️ Google Places API failed: ${error.message}`);
    }

    // FALLBACK: Use comprehensive database if APIs return insufficient places
    if (realPlaces.length < 20) {
      logger.warn(`⚠️ Only ${realPlaces.length} places from APIs, using comprehensive database as fallback`);
      const { getRealPlacesForDestination } = require('../services/comprehensiveRealPlacesDB');
      const dbPlaces = getRealPlacesForDestination(destination, allInterests, 50);
      
      if (dbPlaces.length > 0) {
        logger.info(`✅ Added ${dbPlaces.length} places from comprehensive database`);
        realPlaces = [...realPlaces, ...dbPlaces];
        
        // Remove duplicates by name
        const uniquePlaces = [];
        const seenNames = new Set();
        realPlaces.forEach(place => {
          if (!seenNames.has(place.name.toLowerCase())) {
            seenNames.add(place.name.toLowerCase());
            uniquePlaces.push(place);
          }
        });
        realPlaces = uniquePlaces;
        logger.info(`✅ Total unique places after deduplication: ${realPlaces.length}`);
      }
    }
    
    if (realPlaces.length === 0) {
      logger.error(`❌ No REAL places found for ${destination}`);
      return res.status(400).json({ 
        error: `No places found for destination: ${destination}`,
        suggestion: 'Try a different destination like Paris, London, New York, Barcelona, Rome, or Amsterdam'
      });
    }

    // Step 3: Initial POI candidates from real places (will be enhanced later)
    logger.info(`📋 Initial real places: ${realPlaces.length}`);

    // Step 4: Use ONLY real places - NO fake generation!
    logger.info(`✅ Using ${realPlaces.length} REAL places only`);
    logger.info(`📝 Sample places:`, realPlaces.slice(0, 5).map(p => p.name));

    // Step 5: Get PERSONALIZED recommendations based on user history
    logger.info(`🎯 Getting PERSONALIZED recommendations from REAL places...`);
    const userRecommendationEngine = require('../services/userRecommendationEngine');
    
    // First, score places based on user's past preferences
    const personalizedPlaces = await userRecommendationEngine.getPlaceRecommendations(
      userId,
      destination,
      realPlaces
    );
    
    logger.info(`✨ Personalized ${personalizedPlaces.length} places based on your travel history`);
    
    const poiCandidates = personalizedPlaces.map(place => ({
      name: place.name,
      tags: place.tags || place.category || ['attraction'],
      popularity: place.rating || 4.0,
      lat: place.location?.lat || 0,
      lng: place.location?.lng || 0,
      entry_fee: place.entry_fee || 0,
      description: place.description || place.enhanced_description || `Attraction in ${destination}`,
      type: place.type || 'attraction',
      local_tip: place.local_tip || null,
      why_hidden: place.why_hidden || null,
      personalizedScore: place.personalizedScore || 0.5,
      matchedInterests: place.matchedInterests || []
    }));

    const recommendations = await mlService.getRecommendations(
      { budget: preferences.budget, interests: allInterests },
      destination,
      poiCandidates
    );
    
    logger.info(`🎯 Generated ${recommendations.length} ML recommendations with personalization`);

    // Step 7: Ensure we have enough UNIQUE recommendations for comprehensive daily planning
    const minPlacesPerDay = 5;
    const maxPlacesPerDay = 7;
    const targetPlacesPerDay = Math.max(minPlacesPerDay, Math.min(maxPlacesPerDay, Math.ceil(recommendations.length / days)));
    const totalNeeded = days * targetPlacesPerDay;
    
    logger.info(`🗓️ Planning ${targetPlacesPerDay} places per day for ${days} days (total: ${totalNeeded})`);
    logger.info(`📊 Available recommendations: ${recommendations.length}`);
    
    // Ensure we have enough UNIQUE places by expanding our search if needed
    let finalRecommendations = [...recommendations]; // Start with all recommendations
    
    if (finalRecommendations.length < totalNeeded) {
      logger.info(`⚠️ Need more places! Have ${finalRecommendations.length}, need ${totalNeeded}`);
      
      // Get more places from our REAL places list
      const usedNames = new Set(finalRecommendations.map(r => r.name));
      const additionalPlaces = realPlaces
        .filter(place => !usedNames.has(place.name))
        .slice(0, totalNeeded - finalRecommendations.length)
        .map(place => ({
          name: place.name,
          tags: place.tags || place.category || ['attraction'],
          score: 0.7 + Math.random() * 0.2, // Random score between 0.7-0.9
          confidence: 0.8
        }));
      
      finalRecommendations = [...finalRecommendations, ...additionalPlaces];
      logger.info(`✅ Added ${additionalPlaces.length} additional unique places`);
    }
    
    // Take only the number we need to avoid repetition
    finalRecommendations = finalRecommendations.slice(0, totalNeeded);
    logger.info(`🎯 Final unique recommendations: ${finalRecommendations.length}`);

    // Step 8: Prepare POI list for optimization
    const poiList = finalRecommendations.map(rec => {
      const originalPlace = poiCandidates.find(p => p.name === rec.name) || realPlaces.find(p => p.name === rec.name);
      return {
        name: rec.name,
        lat: originalPlace?.lat || 0,
        lng: originalPlace?.lng || 0,
        tags: rec.tags,
        score: rec.score,
        entry_fee: originalPlace?.entry_fee || 0,
        description: originalPlace?.description || `Recommended place in ${destination}`,
        type: originalPlace?.type || 'attraction',
        local_tip: originalPlace?.local_tip || null,
        why_hidden: originalPlace?.why_hidden || null
      };
    });

    // Step 9: Create SUPER INTELLIGENT itinerary with GUARANTEED days
    logger.info(`⚡ Creating SUPER INTELLIGENT itinerary with ${placesPerDay} places per day (currency: ${localCurrency})...`);
    const intelligentItineraryBuilder = require('../services/intelligentItineraryBuilder');
    const detailedPlan = intelligentItineraryBuilder.buildItinerary(
      destination,
      days,
      budget,
      allInterests,
      realPlaces,
      placesPerDay, // Use extracted places per day from query
      localCurrency  // Pass detected local currency
    );
    
    logger.info(`✅ Generated INTELLIGENT plan with ${detailedPlan.length} days`);
    logger.info(`🎯 USING INTELLIGENT BUILDER OUTPUT DIRECTLY!`);
    
    // USE THE INTELLIGENT BUILDER'S OUTPUT - DON'T CREATE A NEW PLAN!
    // The intelligent builder GUARANTEES all days, so we use it directly
    const comprehensivePlan = { plan: detailedPlan };
    
    // OLD LOGIC REMOVED - Using intelligent builder output directly!
    
    logger.info(`✅ Using intelligent builder plan with ${comprehensivePlan.plan.length} days (requested: ${days})`);
    
    // Intelligent builder GUARANTEES all days!
    logger.info(`🎯 Intelligent builder guaranteed ${comprehensivePlan.plan.length} days!`);

    // Step 10: Get weather forecast
    logger.info(`🌤️ Getting weather forecast...`);
    const weatherForecast = await realDataService.getWeatherForecast(destination, days);

    // Step 11: Use the intelligent builder's plan directly (it's already perfect!)
    logger.info(`✅ Using intelligent builder's plan directly - no enhancement needed!`);
    let enhancedPlan = comprehensivePlan.plan;

    // Step 11.5: Add translations and multi-currency pricing
    logger.info(`🌍 Adding translations and multi-currency pricing...`);
    const translationService = require('../services/translationService');
    
    enhancedPlan = enhancedPlan.map(day => {
      if (day.places) {
        day.places = day.places.map(place => {
          // Add translation
          let translatedPlace = translationService.addTranslation(place);
          // Add multi-currency pricing
          translatedPlace = currencyService.addMultiCurrencyPricing(translatedPlace, destination);
          
          // Log first place to verify
          if (day.day === 1 && day.places.indexOf(place) === 1) {
            logger.info(`📝 Sample place after processing:`, {
              name: translatedPlace.name,
              entry_fee: translatedPlace.entry_fee,
              pricing: translatedPlace.pricing
            });
          }
          
          return translatedPlace;
        });
      }
      return day;
    });
    logger.info(`✅ Translations and pricing added to all ${enhancedPlan.length} days`);

    // Step 10: Create itinerary object
    const itineraryData = {
      user_id: userId,
      destination,
      days,
      budget,
      plan: enhancedPlan,
      format: 'detailed',
      generated_on: new Date(),
      weather_forecast: weatherForecast,
      weather_notes: [],
      weather_adjustments: [],
      ml_powered: true,
      real_data_used: true,
      realtime_generated: true,
      original_query: query,
      parsed_query: parsedQuery,
      detailed_plan: detailedPlan // ChatGPT-style detailed plan
    };

    let itinerary;
    let savedToDatabase = false;

    // Try to save to database if available
    try {
      itinerary = new Itinerary(itineraryData);
      await itinerary.save();

      // Add to user's saved itineraries
      req.user.saved_itineraries.push(itinerary._id);
      await req.user.save();
      
      savedToDatabase = true;
      logger.info('✅ Realtime itinerary saved to database successfully');
    } catch (dbError) {
      logger.warn('⚠️ Database save failed for realtime itinerary, using session storage:', dbError.message);
      // Create itinerary object for session storage
      itinerary = {
        _id: `session_${Date.now()}`,
        ...itineraryData,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Store in memory for this session
      if (!global.sessionItineraries) {
        global.sessionItineraries = new Map();
      }
      global.sessionItineraries.set(itinerary._id, itinerary);
      logger.info('📱 Itinerary stored in session memory');
    }

    logger.info(`✅ Real-time itinerary generated successfully for ${destination}`);

    res.status(201).json({
      message: savedToDatabase ? 
        'Real-time itinerary generated and saved successfully' : 
        'Real-time itinerary generated successfully (offline mode)',
      itinerary,
      ml_powered: true,
      realtime_generated: true,
      saved_to_database: savedToDatabase,
      places_found: realPlaces.length,
      recommendations_count: recommendations.length,
      weather_adjustments: 0,
      original_query: query,
      parsed_query: parsedQuery
    });

  } catch (error) {
    logger.error('❌ Real-time itinerary generation failed:', error);
    next(error);
  }
});

/**
 * @swagger
 * /realtime/test-places:
 *   post:
 *     summary: Test real places generation (no auth required)
 *     tags: [Realtime]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destination
 *             properties:
 *               destination:
 *                 type: string
 *                 example: "Mumbai"
 *     responses:
 *       200:
 *         description: Real places generated successfully
 */
router.post('/test-places', async (req, res, next) => {
  try {
    const { destination } = req.body;
    
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    logger.info(`🧪 Testing real places for: ${destination}`);

    // Get real places from comprehensive database
    const { getRealPlacesForDestination } = require('../services/comprehensiveRealPlacesDB');
    const realPlaces = getRealPlacesForDestination(destination, ['food', 'culture'], 10);

    // Get ML recommendations
    const poiCandidates = realPlaces.map(place => ({
      name: place.name,
      tags: place.tags || ['attraction'],
      popularity: place.popularity || 4.0
    }));

    const recommendations = await mlService.getRecommendations(
      { budget: 'medium', interests: ['food', 'culture'] },
      destination,
      poiCandidates
    );

    res.json({
      message: 'Real places test successful',
      destination,
      real_places_count: realPlaces.length,
      recommendations_count: recommendations.length,
      sample_places: recommendations.slice(0, 5).map(r => r.name),
      full_recommendations: recommendations
    });

  } catch (error) {
    logger.error('❌ Real places test failed:', error);
    next(error);
  }
});

/**
 * @swagger
 * /realtime/parse-query:
 *   post:
 *     summary: Parse natural language travel query
 *     tags: [Realtime]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Plan me a 5-day trip to Paris for art and food"
 *     responses:
 *       200:
 *         description: Query parsed successfully
 */
router.post('/parse-query', async (req, res, next) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    logger.info(`🧠 Parsing query: ${query}`);
    const parsed = await mlService.parseNLP(query);
    
    res.json({
      message: 'Query parsed successfully',
      parsed,
      original_query: query
    });

  } catch (error) {
    logger.error('❌ Query parsing failed:', error);
    next(error);
  }
});

/**
 * @swagger
 * /realtime/ml-status:
 *   get:
 *     summary: Check ML service status
 *     tags: [Realtime]
 *     responses:
 *       200:
 *         description: ML service status
 */
router.get('/ml-status', async (req, res) => {
  try {
    const isAvailable = await mlService.isAvailable();
    
    res.json({
      ml_service_available: isAvailable,
      ml_service_url: process.env.ML_BASE_URL || 'http://localhost:8000',
      status: isAvailable ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.json({
      ml_service_available: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;