const express = require( 'express' );
const Joi = require( 'joi' );
const multer = require( 'multer' );
const path = require( 'path' );
const Memory = require( '../models/Memory' );
const { authenticateToken } = require( '../middleware/auth' );
const { validateRequest, validateQuery } = require( '../middleware/validation' );
const mlService = require( '../services/mlService' );

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage( {
  destination: ( req, file, cb ) =>
  {
    cb( null, 'uploads/memories/' );
  },
  filename: ( req, file, cb ) =>
  {
    const uniqueSuffix = Date.now() + '-' + Math.round( Math.random() * 1E9 );
    cb( null, file.fieldname + '-' + uniqueSuffix + path.extname( file.originalname ) );
  }
} );

const upload = multer( {
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: ( req, file, cb ) =>
  {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test( path.extname( file.originalname ).toLowerCase() );
    const mimetype = allowedTypes.test( file.mimetype );

    if ( mimetype && extname )
    {
      return cb( null, true );
    } else
    {
      cb( new Error( 'Only image files are allowed' ) );
    }
  }
} );

// Validation schemas
const createMemorySchema = Joi.object( {
  title: Joi.string().trim().min( 1 ).max( 200 ).required(),
  note: Joi.string().trim().max( 1000 ),
  location: Joi.object( {
    place_id: Joi.string(),
    name: Joi.string(),
    lat: Joi.number().min( -90 ).max( 90 ),
    lng: Joi.number().min( -180 ).max( 180 )
  } ),
  tags: Joi.array().items( Joi.string().trim() ),
  weather: Joi.string().trim(),
  layout: Joi.string().valid( 'Polaroid', 'Magazine', 'Collage' ).default( 'Magazine' ),
  is_public: Joi.boolean().default( false )
} );

const listSchema = Joi.object( {
  limit: Joi.number().min( 1 ).max( 100 ).default( 20 ),
  offset: Joi.number().min( 0 ).default( 0 ),
  tags: Joi.string().trim()
} );

/**
 * @swagger
 * /memories:
 *   post:
 *     summary: Create a new memory with image upload
 *     tags: [Memories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *               note:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               location:
 *                 type: string
 *               tags:
 *                 type: string
 *               weather:
 *                 type: string
 *               is_public:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Memory created successfully
 *       400:
 *         description: Validation error
 */
router.post( '/', authenticateToken, upload.single( 'image' ), async ( req, res, next ) =>
{
  try
  {
    if ( !req.file )
    {
      return res.status( 400 ).json( { error: 'Image file is required' } );
    }

    // Parse JSON fields from form data
    const data = { ...req.body };
    if ( data.location )
    {
      try
      {
        data.location = JSON.parse( data.location );
      } catch ( e )
      {
        delete data.location;
      }
    }
    if ( data.tags )
    {
      try
      {
        data.tags = JSON.parse( data.tags );
      } catch ( e )
      {
        data.tags = data.tags.split( ',' ).map( tag => tag.trim() );
      }
    }

    // Validate the data
    const { error, value } = createMemorySchema.validate( data );
    if ( error )
    {
      return res.status( 400 ).json( {
        error: 'Validation failed',
        details: error.details.map( detail => ( {
          field: detail.path.join( '.' ),
          message: detail.message
        } ) )
      } );
    }

    // Calculate base URL dynamically
    const baseUrl = process.env.BACKEND_URL || `${ req.protocol }://${ req.get( 'host' ) }`;
    const imageUrl = `/uploads/memories/${ req.file.filename }`;

    // Generate caption using ML service
    let caption = '';
    try
    {
      if ( value.location && value.weather )
      {
        const captionResult = await mlService.generateCaption(
          value.location,
          new Date().toISOString().split( 'T' )[ 0 ],
          value.weather
        );
        caption = captionResult.caption;
      }
    } catch ( error )
    {
      // Use fallback caption if ML service fails
      caption = `${ value.title } - A wonderful memory!`;
    }

    // Create memory
    const memory = new Memory( {
      user_id: req.user._id,
      title: value.title,
      image_url: imageUrl,
      note: value.note,
      caption,
      location: value.location,
      tags: value.tags,
      weather: value.weather,
      layout: value.layout || 'Magazine',
      is_public: value.is_public,
      created_on: new Date()
    } );

    await memory.save();

    // Add to user's digital memories
    req.user.digital_memories.push( memory._id );
    await req.user.save();

    res.status( 201 ).json( memory );
  } catch ( error )
  {
    next( error );
  }
} );

/**
 * @swagger
 * /memories:
 *   get:
 *     summary: Get user's memories
 *     tags: [Memories]
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
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *     responses:
 *       200:
 *         description: List of memories
 */
router.get( '/', authenticateToken, validateQuery( listSchema ), async ( req, res, next ) =>
{
  try
  {
    const { limit, offset, tags } = req.query;
    const userId = req.user._id;

    // If database is not connected, return empty array
    if ( !req.app.locals.dbConnected )
    {
      return res.json( {
        memories: [],
        total: 0,
        has_more: false
      } );
    }

    let query = { user_id: userId };

    if ( tags )
    {
      const tagArray = tags.split( ',' ).map( tag => tag.trim() );
      query.tags = { $in: tagArray };
    }

    try
    {
      const memories = await Memory.find( query )
        .sort( { created_on: -1 } )
        .limit( limit )
        .skip( offset )
        .lean();

      const total = await Memory.countDocuments( query );
      const hasMore = offset + limit < total;

      res.json( {
        memories,
        total,
        has_more: hasMore
      } );
    } catch ( dbError )
    {
      // Database timeout - return empty
      console.warn( 'Memories query failed:', dbError.message );
      res.json( {
        memories: [],
        total: 0,
        has_more: false
      } );
    }
  } catch ( error )
  {
    next( error );
  }
} );

/**
 * @swagger
 * /memories/{id}:
 *   get:
 *     summary: Get memory by ID
 *     tags: [Memories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory ID
 *     responses:
 *       200:
 *         description: Memory details
 *       404:
 *         description: Memory not found
 */
router.get( '/:id', authenticateToken, async ( req, res, next ) =>
{
  try
  {
    const { id } = req.params;
    const userId = req.user._id;

    const memory = await Memory.findOne( {
      _id: id,
      $or: [
        { user_id: userId },
        { is_public: true }
      ]
    } ).lean();

    if ( !memory )
    {
      return res.status( 404 ).json( { error: 'Memory not found' } );
    }

    res.json( memory );
  } catch ( error )
  {
    next( error );
  }
} );

/**
 * @swagger
 * /memories/{id}:
 *   delete:
 *     summary: Delete memory
 *     tags: [Memories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory ID
 *     responses:
 *       200:
 *         description: Memory deleted successfully
 *       404:
 *         description: Memory not found
 */
router.delete( '/:id', authenticateToken, async ( req, res, next ) =>
{
  try
  {
    const { id } = req.params;
    const userId = req.user._id;

    const memory = await Memory.findOneAndDelete( {
      _id: id,
      user_id: userId
    } );

    if ( !memory )
    {
      return res.status( 404 ).json( { error: 'Memory not found' } );
    }

    // Remove from user's digital memories
    req.user.digital_memories = req.user.digital_memories.filter(
      memId => !memId.equals( id )
    );
    await req.user.save();

    // TODO: Delete the actual image file from filesystem

    res.json( { message: 'Memory deleted successfully' } );
  } catch ( error )
  {
    next( error );
  }
} );

/**
 * @swagger
 * /memories/{id}/postcard:
 *   get:
 *     summary: Generate postcard from memory
 *     tags: [Memories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory ID
 *     responses:
 *       200:
 *         description: Postcard data
 */
router.get( '/:id/postcard', authenticateToken, async ( req, res, next ) =>
{
  try
  {
    const { id } = req.params;
    const userId = req.user._id;

    const memory = await Memory.findOne( {
      _id: id,
      user_id: userId
    } ).lean();

    if ( !memory )
    {
      return res.status( 404 ).json( { error: 'Memory not found' } );
    }

    // Generate postcard data
    const postcard = {
      title: memory.title,
      image_url: memory.image_url,
      caption: memory.caption || memory.note,
      location: memory.location?.name || 'Unknown Location',
      date: memory.created_on,
      weather: memory.weather
    };

    res.json( postcard );
  } catch ( error )
  {
    next( error );
  }
} );

module.exports = router;