const express = require( 'express' );
const Joi = require( 'joi' );
const Place = require( '../models/Place' );
const mapsService = require( '../services/mapsService' );
const placePersistenceService = require( '../services/placePersistenceService' );
const { validateQuery } = require( '../middleware/validation' );

const { optionalAuth } = require( '../middleware/auth' );

const router = express.Router();

// Validation schemas
const searchSchema = Joi.object( {
  q: Joi.string().trim().min( 1 ).max( 100 ),
  city: Joi.string().trim().max( 100 ),
  country: Joi.string().trim().max( 100 ),
  tags: Joi.string().trim(),
  rating: Joi.number().min( 0 ).max( 5 ),
  lat: Joi.number().min( -90 ).max( 90 ),
  lng: Joi.number().min( -180 ).max( 180 ),
  radius: Joi.number().min( 100 ).max( 50000 ).default( 5000 ),
  limit: Joi.number().min( 1 ).max( 100 ).default( 20 ),
  offset: Joi.number().min( 0 ).default( 0 )
} );

/**
 * @swagger
 * /places/search:
 *   get:
 *     summary: Search for places
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tags
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Minimum rating
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude for location-based search
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude for location-based search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in meters (default 5000)
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
 *     responses:
 *       200:
 *         description: List of places
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 places:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Place'
 *                 total:
 *                   type: number
 *                 has_more:
 *                   type: boolean
 */
router.get( '/search', optionalAuth, validateQuery( searchSchema ), async ( req, res, next ) =>
{
  try
  {
    const { q, city, country, tags, rating, lat, lng, radius, limit, offset } = req.query;

    let query = {};
    let places = [];

    // Build MongoDB query
    if ( q )
    {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if ( city )
    {
      query.city = { $regex: city, $options: 'i' };
    }

    if ( country )
    {
      query.country = { $regex: country, $options: 'i' };
    }

    if ( tags )
    {
      const tagArray = tags.split( ',' ).map( tag => tag.trim() );
      query.tags = { $in: tagArray };
    }

    if ( rating )
    {
      query.rating = { $gte: rating };
    }

    // Location-based search
    if ( lat && lng )
    {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [ lng, lat ]
          },
          $maxDistance: radius
        }
      };
    }

    // Execute database query
    const dbPlaces = await Place.find( query )
      .sort( { rating: -1, name: 1 } )
      .limit( limit )
      .skip( offset )
      .lean();

    places = dbPlaces;

    // If we have location and few results, supplement with Google Places
    if ( lat && lng && places.length < limit / 2 && q )
    {
      try
      {
        const googlePlaces = await mapsService.searchPlaces( q, { lat, lng }, radius );

        // Caching: Save newly discovered places to database
        try
        {
          // We pass city/country from query if available
          placePersistenceService.upsertPlaces( googlePlaces, city, country );
        } catch ( persistError )
        {
          console.warn( 'Failed to persist supplemental places:', persistError.message );
        }

        // Filter out places we already have
        const existingPlaceIds = new Set( places.map( p => p.place_id ) );
        const newPlaces = googlePlaces.filter( p => !existingPlaceIds.has( p.place_id ) );

        places = [ ...places, ...newPlaces.slice( 0, limit - places.length ) ];
      } catch ( error )
      {
        // Continue with database results if Google Places fails
        console.warn( 'Google Places search failed:', error.message );
      }
    }

    const total = await Place.countDocuments( query );
    const hasMore = offset + limit < total;

    res.json( {
      places,
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
 * /places/{id}:
 *   get:
 *     summary: Get place by ID
 *     tags: [Places]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Place ID
 *     responses:
 *       200:
 *         description: Place details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Place'
 *       404:
 *         description: Place not found
 */
router.get( '/:id', optionalAuth, async ( req, res, next ) =>
{
  try
  {
    const { id } = req.params;

    // Try to find in database first
    let place = await Place.findOne( { place_id: id } ).lean();

    // If not found in database, try Google Places
    if ( !place )
    {
      try
      {
        place = await mapsService.getPlaceDetails( id );

        // Caching: Save to database for future lookups
        if ( place )
        {
          try
          {
            placePersistenceService.savePlace( place );
          } catch ( persistError )
          {
            console.warn( 'Failed to persist place details:', persistError.message );
          }
        }
      } catch ( error )
      {
        return res.status( 404 ).json( { error: 'Place not found' } );
      }
    }

    res.json( place );
  } catch ( error )
  {
    next( error );
  }
} );

/**
 * @swagger
 * /places/nearby:
 *   get:
 *     summary: Get nearby places
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in meters (default 1000)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Place type filter
 *     responses:
 *       200:
 *         description: List of nearby places
 */
router.get( '/nearby', optionalAuth, async ( req, res, next ) =>
{
  try
  {
    const { lat, lng, radius = 1000, type } = req.query;

    if ( !lat || !lng )
    {
      return res.status( 400 ).json( { error: 'Latitude and longitude are required' } );
    }

    let query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [ parseFloat( lng ), parseFloat( lat ) ]
          },
          $maxDistance: parseInt( radius )
        }
      }
    };

    if ( type )
    {
      query.category = type;
    }

    const places = await Place.find( query )
      .limit( 20 )
      .lean();

    res.json( { places } );
  } catch ( error )
  {
    next( error );
  }
} );

module.exports = router;