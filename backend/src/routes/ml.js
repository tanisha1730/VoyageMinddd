const express = require( 'express' );
const Joi = require( 'joi' );
const { authenticateToken } = require( '../middleware/auth' );
const { validateRequest } = require( '../middleware/validation' );
const mlService = require( '../services/mlService' );

const router = express.Router();

// Validation schemas
const nlpParseSchema = Joi.object( {
  text: Joi.string().trim().min( 1 ).max( 1000 ).required()
} );

const recommendSchema = Joi.object( {
  user_id: Joi.string().required(),
  preferences: Joi.object( {
    budget: Joi.string().valid( 'low', 'medium', 'high' ),
    interests: Joi.array().items( Joi.string() )
  } ).required(),
  destination: Joi.string().required(),
  poi_candidates: Joi.array().items( Joi.object() ).required()
} );

const optimizeSchema = Joi.object( {
  poi_list: Joi.array().items( Joi.object() ).required(),
  start_location: Joi.object( {
    lat: Joi.number().required(),
    lng: Joi.number().required()
  } ).required(),
  daily_time_budget: Joi.number().min( 1 ).max( 24 ).required(),
  days: Joi.number().min( 1 ).max( 30 ).required(),
  opening_hours: Joi.object().default( {} ),
  distance_matrix: Joi.array().items( Joi.array() ).required()
} );

const weatherAdjustSchema = Joi.object( {
  itinerary: Joi.object().required(),
  weather_forecast: Joi.array().items( Joi.object( {
    day: Joi.number().required(),
    condition: Joi.string().required(),
    temperature: Joi.number(),
    precipitation: Joi.number()
  } ) ).required()
} );

const postcardCaptionSchema = Joi.object( {
  poi: Joi.object().required(),
  date: Joi.string().pattern( /^\d{4}-\d{2}-\d{2}$/ ).required(),
  weather: Joi.string().required(),
  image_features: Joi.object().optional()
} );

const generateTextSchema = Joi.object( {
  prompt: Joi.string().required()
} );

/**
 * @swagger
 * /ml/nlp/parse:
 *   post:
 *     summary: Parse natural language travel request
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "I want to visit Paris for 5 days with a budget of 2000 euros, interested in art and food"
 *     responses:
 *       200:
 *         description: Parsed travel request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 destination:
 *                   type: string
 *                 days:
 *                   type: number
 *                 budget:
 *                   type: number
 *                 interests:
 *                   type: array
 *                   items:
 *                     type: string
 *                 confidence:
 *                   type: object
 *                   properties:
 *                     destination:
 *                       type: number
 *                     days:
 *                       type: number
 *                     budget:
 *                       type: number
 */
router.post( '/nlp/parse', authenticateToken, validateRequest( nlpParseSchema ), async ( req, res, next ) =>
{
  try
  {
    const result = await mlService.parseNLP( req.body.text );
    res.json( result );
  } catch ( error )
  {
    // Return fallback response if ML service is unavailable
    res.status( 503 ).json( {
      error: 'ML service unavailable',
      fallback: {
        destination: '',
        days: 3,
        budget: 1000,
        interests: [],
        confidence: {
          destination: 0.0,
          days: 0.0,
          budget: 0.0
        }
      }
    } );
  }
} );

/**
 * @swagger
 * /ml/recommend:
 *   post:
 *     summary: Get place recommendations
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - preferences
 *               - destination
 *               - poi_candidates
 *             properties:
 *               user_id:
 *                 type: string
 *               preferences:
 *                 type: object
 *               destination:
 *                 type: string
 *               poi_candidates:
 *                 type: array
 *     responses:
 *       200:
 *         description: Recommended places with scores
 */
router.post( '/recommend', authenticateToken, validateRequest( recommendSchema ), async ( req, res, next ) =>
{
  try
  {
    const result = await mlService.getRecommendations( req.body );
    res.json( result );
  } catch ( error )
  {
    // Return fallback recommendations
    const { poi_candidates } = req.body;
    const fallback = poi_candidates.slice( 0, 10 ).map( ( poi, index ) => ( {
      place_id: poi.place_id,
      score: 0.8 - ( index * 0.05 ),
      tags: poi.tags || []
    } ) );

    res.status( 503 ).json( {
      error: 'ML service unavailable',
      fallback
    } );
  }
} );

/**
 * @swagger
 * /ml/optimize:
 *   post:
 *     summary: Optimize itinerary routing
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - poi_list
 *               - start_location
 *               - daily_time_budget
 *               - days
 *               - distance_matrix
 *             properties:
 *               poi_list:
 *                 type: array
 *               start_location:
 *                 type: object
 *               daily_time_budget:
 *                 type: number
 *               days:
 *                 type: number
 *               distance_matrix:
 *                 type: array
 *     responses:
 *       200:
 *         description: Optimized itinerary plan
 */
router.post( '/optimize', authenticateToken, validateRequest( optimizeSchema ), async ( req, res, next ) =>
{
  try
  {
    const result = await mlService.optimizeItinerary( req.body );
    res.json( result );
  } catch ( error )
  {
    // Return basic fallback optimization
    const { poi_list, days } = req.body;
    const placesPerDay = Math.ceil( poi_list.length / days );

    const plan = [];
    for ( let day = 1; day <= days; day++ )
    {
      const dayPlaces = poi_list
        .slice( ( day - 1 ) * placesPerDay, day * placesPerDay )
        .map( ( poi, index ) => ( {
          place_id: poi.place_id,
          name: poi.name || `Place ${ index + 1 }`,
          start_time: `${ 9 + index * 2 }:00`,
          end_time: `${ 11 + index * 2 }:00`
        } ) );

      plan.push( { day, places: dayPlaces } );
    }

    res.status( 503 ).json( {
      error: 'ML service unavailable',
      fallback: { plan }
    } );
  }
} );

/**
 * @swagger
 * /ml/weather-adjust:
 *   post:
 *     summary: Adjust itinerary based on weather
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itinerary
 *               - weather_forecast
 *             properties:
 *               itinerary:
 *                 type: object
 *               weather_forecast:
 *                 type: array
 *     responses:
 *       200:
 *         description: Weather-adjusted itinerary
 */
router.post( '/weather-adjust', authenticateToken, validateRequest( weatherAdjustSchema ), async ( req, res, next ) =>
{
  try
  {
    const result = await mlService.adjustForWeather( req.body );
    res.json( result );
  } catch ( error )
  {
    // Return original itinerary if service unavailable
    res.status( 503 ).json( {
      error: 'ML service unavailable',
      fallback: req.body.itinerary
    } );
  }
} );

/**
 * @swagger
 * /ml/postcard/caption:
 *   post:
 *     summary: Generate postcard caption
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - poi
 *               - date
 *               - weather
 *             properties:
 *               poi:
 *                 type: object
 *               date:
 *                 type: string
 *               weather:
 *                 type: string
 *               image_features:
 *                 type: object
 *     responses:
 *       200:
 *         description: Generated caption
 */
router.post( '/postcard/caption', authenticateToken, validateRequest( postcardCaptionSchema ), async ( req, res, next ) =>
{
  try
  {
    const result = await mlService.generatePostcardCaption( req.body );
    res.json( result );
  } catch ( error )
  {
    // Return fallback caption
    const { poi, date, weather } = req.body;
    const fallback = {
      caption: `Visiting ${ poi.name || 'this amazing place' } on ${ date }. What a ${ weather.toLowerCase() } day for exploring!`
    };

    res.status( 503 ).json( {
      error: 'ML service unavailable',
      fallback
    } );
  }
} );

/**
 * @swagger
 * /ml/nlp/generate:
 *   post:
 *     summary: Generate text from prompt
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Generated text
 */
router.post( '/nlp/generate', authenticateToken, validateRequest( generateTextSchema ), async ( req, res, next ) =>
{
  try
  {
    const result = await mlService.generateText( req.body.prompt );
    res.json( result );
  } catch ( error )
  {
    next( error );
  }
} );

module.exports = router;