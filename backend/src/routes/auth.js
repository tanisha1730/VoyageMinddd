const express = require( 'express' );
const jwt = require( 'jsonwebtoken' );
const bcrypt = require( 'bcryptjs' );
const Joi = require( 'joi' );
const User = require( '../models/User' );
const { validateRequest } = require( '../middleware/validation' );
const logger = require( '../utils/logger' );

const router = express.Router();

// Validation schemas
const signupSchema = Joi.object( {
  name: Joi.string().trim().min( 2 ).max( 100 ).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min( 8 ).max( 128 ).required(),
  preferences: Joi.object( {
    budget: Joi.string().valid( 'low', 'medium', 'high' ).default( 'medium' ),
    interests: Joi.array().items( Joi.string().trim() ).default( [] )
  } ).default( {} )
} );

const loginSchema = Joi.object( {
  email: Joi.string().email().required(),
  password: Joi.string().required()
} );

const refreshSchema = Joi.object( {
  refresh_token: Joi.string().required()
} );

// Generate tokens
const generateTokens = ( userId ) =>
{
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
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
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post( '/signup', validateRequest( signupSchema ), async ( req, res, next ) =>
{
  try
  {
    const { name, email, password, preferences } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne( { email } );
    if ( existingUser )
    {
      return res.status( 409 ).json( { error: 'Email already registered' } );
    }

    // Create new user
    const user = new User( {
      name,
      email,
      password_hash: password, // Will be hashed by pre-save middleware
      preferences: preferences || { budget: 'medium', interests: [] }
    } );

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens( user._id );

    // Hash and store refresh token
    const refreshTokenHash = await bcrypt.hash( refreshToken, 10 );
    user.refresh_tokens.push( {
      token_hash: refreshTokenHash,
      expires_at: new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ) // 7 days
    } );
    await user.save();

    logger.info( `User registered: ${ email }` );

    res.status( 201 ).json( {
      message: 'User created successfully',
      user,
      access_token: accessToken,
      refresh_token: refreshToken
    } );
  } catch ( error )
  {
    next( error );
  }
} );

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post( '/login', validateRequest( loginSchema ), async ( req, res, next ) =>
{
  try
  {
    const { email, password } = req.body;

    // Check if we're in offline mode (no database connection)
    if ( !req.app.locals.dbConnected )
    {
      // Offline mode - create a mock user for testing
      const mongoose = require( 'mongoose' );
      const mockUser = {
        _id: new mongoose.Types.ObjectId( '507f1f77bcf86cd799439011' ),
        name: 'Test User',
        email: email,
        preferences: {
          budget: 'medium',
          interests: [ 'culture', 'food', 'art' ]
        },
        saved_itineraries: []
      };

      // Generate tokens for offline user
      const { accessToken, refreshToken } = generateTokens( mockUser._id.toString() );

      logger.info( `User logged in (offline mode): ${ email }` );

      return res.json( {
        message: 'Login successful (offline mode)',
        user: mockUser,
        access_token: accessToken,
        refresh_token: refreshToken
      } );
    }

    // Normal database mode
    // Find user
    const user = await User.findOne( { email } );
    if ( !user )
    {
      logger.warn( `❌ Login failed: User not found for ${ email }` );
      return res.status( 401 ).json( { error: 'Invalid credentials' } );
    }

    // Check password
    const isValidPassword = await user.comparePassword( password );
    if ( !isValidPassword )
    {
      logger.warn( `❌ Login failed: Invalid password for ${ email }` );
      return res.status( 401 ).json( { error: 'Invalid credentials' } );
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens( user._id );

    // Hash and store refresh token
    const refreshTokenHash = await bcrypt.hash( refreshToken, 10 );
    user.refresh_tokens.push( {
      token_hash: refreshTokenHash,
      expires_at: new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 )
    } );

    // Clean up expired tokens
    user.refresh_tokens = user.refresh_tokens.filter(
      token => token.expires_at > new Date()
    );

    await user.save();

    logger.info( `User logged in: ${ email }` );

    res.json( {
      message: 'Login successful',
      user,
      access_token: accessToken,
      refresh_token: refreshToken
    } );
  } catch ( error )
  {
    next( error );
  }
} );

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post( '/refresh', validateRequest( refreshSchema ), async ( req, res, next ) =>
{
  try
  {
    const { refresh_token } = req.body;

    // Verify refresh token
    const decoded = jwt.verify( refresh_token, process.env.REFRESH_TOKEN_SECRET );
    const user = await User.findById( decoded.userId );

    if ( !user )
    {
      return res.status( 401 ).json( { error: 'Invalid refresh token' } );
    }

    // Check if refresh token exists and is valid
    const tokenExists = await Promise.all(
      user.refresh_tokens.map( async ( tokenObj ) =>
      {
        if ( tokenObj.expires_at > new Date() )
        {
          return bcrypt.compare( refresh_token, tokenObj.token_hash );
        }
        return false;
      } )
    );

    if ( !tokenExists.some( Boolean ) )
    {
      return res.status( 401 ).json( { error: 'Invalid refresh token' } );
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json( {
      access_token: accessToken
    } );
  } catch ( error )
  {
    if ( error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' )
    {
      return res.status( 401 ).json( { error: 'Invalid refresh token' } );
    }
    next( error );
  }
} );

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post( '/logout', validateRequest( refreshSchema ), async ( req, res, next ) =>
{
  try
  {
    const { refresh_token } = req.body;

    // Decode token to get user ID (don't verify expiration)
    const decoded = jwt.decode( refresh_token );
    if ( !decoded || !decoded.userId )
    {
      return res.status( 400 ).json( { error: 'Invalid token format' } );
    }

    const user = await User.findById( decoded.userId );
    if ( user )
    {
      // Remove the specific refresh token
      user.refresh_tokens = user.refresh_tokens.filter( async ( tokenObj ) =>
      {
        return !( await bcrypt.compare( refresh_token, tokenObj.token_hash ) );
      } );
      await user.save();
    }

    res.json( { message: 'Logout successful' } );
  } catch ( error )
  {
    next( error );
  }
} );

module.exports = router;