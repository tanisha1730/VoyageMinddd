// Import core Express framework
const express = require( 'express' );
// Import Mongoose for MongoDB interactions
const mongoose = require( 'mongoose' );
// Import CORS to handle cross-origin requests
const cors = require( 'cors' );
// Import Helmet for securing HTTP headers
const helmet = require( 'helmet' );
// Import Rate Limit to prevent abuse
const rateLimit = require( 'express-rate-limit' );
// Load environment variables from .env file
require( 'dotenv' ).config();

// Import route handlers for different features
const authRoutes = require( './routes/auth' ); // Authentication routes (login, register)
const userRoutes = require( './routes/users' ); // User management routes
const placeRoutes = require( './routes/places' ); // Place data routes
const itineraryRoutes = require( './routes/itineraries' ); // Itinerary generation and management
const memoryRoutes = require( './routes/memories' ); // Memory/Journal routes
const mlRoutes = require( './routes/ml' ); // Machine Learning features
const exportRoutes = require( './routes/export' ); // Export functionality (PDF, ICS)
const realtimeRoutes = require( './routes/realtime' ); // Real-time updates
const cleanupRoutes = require( './routes/cleanup' ); // Maintenance routes
const flightRoutes = require( './routes/flights' ); // Flight search routes

// Import custom middleware and configuration
const { errorHandler } = require( './middleware/errorHandler' ); // Global error handler
const { setupSwagger } = require( './config/swagger' ); // API documentation setup
const logger = require( './utils/logger' ); // Custom logging utility

// Initialize Express application
const app = express();
// Define the port, defaulting to 3001 if not specified in env
const PORT = process.env.PORT || 3001;

// --- Security Middleware Configuration ---

// Use Helmet to set secure HTTP headers
app.use( helmet( {
  // Configure Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Disable Content Security Policy to allow loading external images/assets easily
  contentSecurityPolicy: false
} ) );

// Configure Cross-Origin Resource Sharing (CORS)
app.use( cors( {
  // Allow the production Vercel URL, local dev ports, and an optional FRONTEND_URL env var
  origin: ( origin, callback ) => {
    const allowedOrigins = [
      'https://voyage-mind-frontend.vercel.app', 
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:3002', 
      'http://localhost:3003', 
      'http://localhost:5173'
    ];
    if ( process.env.FRONTEND_URL ) allowedOrigins.push( process.env.FRONTEND_URL );
    
    // Allow requests with no origin (like mobile apps or curl) or if origin is in allowedOrigins
    if ( !origin || allowedOrigins.some( o => origin.startsWith( o ) ) ) {
      callback( null, true );
    } else {
      callback( new Error( 'Not allowed by CORS' ) );
    }
  },
  // Allow cookies/headers to be sent across origins
  credentials: true
} ) );

// --- Rate Limiting Configuration ---

// specific limiter for general API endpoints
const limiter = rateLimit( {
  windowMs: 15 * 60 * 1000, // Time window: 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP' // Error message on limit exceeded
} );
// Apply general rate limiter to all requests
app.use( limiter );

// --- Debug Logging ---

// Middleware to log every incoming request
app.use( ( req, res, next ) =>
{
  // Log METHOD, URL, and Origin/IP
  console.log( `📡 ${ req.method } ${ req.url } from ${ req.headers.origin || req.ip }` );
  // Proceed to next middleware
  next();
} );

// --- Auth Specific Rate Limiting ---

// Stricter limiter for authentication routes (login/register) to prevent brute force
const authLimiter = rateLimit( {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 attempts per window
  message: 'Too many authentication attempts'
} );

// --- Body Parsing Middleware ---

// FIX: Middleware to handle "unsupported charset 'UTF-8'" error
// Some clients send charset="UTF-8" (with quotes) which body-parser fails to parse
app.use( ( req, res, next ) =>
{
  const contentType = req.headers[ 'content-type' ];
  if ( contentType )
  {
    if ( contentType.includes( 'charset' ) )
    {
      // Regex to find charset with quotes (e.g., charset="UTF-8")
      const newContentType = contentType.replace( /charset\s*=\s*["']?UTF-8["']?/i, 'charset=UTF-8' );
      if ( newContentType !== contentType )
      {
        console.log( `🔧 Fixed Content-Type header: ${ contentType } -> ${ newContentType }` );
        req.headers[ 'content-type' ] = newContentType;
      }
    }
  }
  next();
} );

// Parse JSON bodies, with increased limit for large payloads (e.g. images)
app.use( express.json( { limit: '10mb' } ) );

// FIX: Catch-all for JSON parsing errors (like unsupported charset if regex misses it)
app.use( ( err, req, res, next ) =>
{
  if ( err instanceof SyntaxError && err.status === 400 && 'body' in err )
  {
    console.error( '❌ JSON Parsing Error:', err.message );
    return res.status( 400 ).json( { error: 'Invalid JSON format', details: err.message } );
  }
  if ( err.type === 'charset.unsupported' )
  {
    console.error( '❌ Unsupported Charset Error:', err.message );
    return res.status( 415 ).json( { error: 'Unsupported parameters: charset', details: 'Please use UTF-8' } );
  }
  next( err );
} );
// Parse URL-encoded bodies (form data)
app.use( express.urlencoded( { extended: true } ) );

// --- Static File Serving ---

// Serve files from the 'uploads' directory publicly
app.use( '/uploads', express.static( 'uploads' ) );

// --- Route Definitions ---

// Mount authentication routes with stricter rate limiting
app.use( '/auth', authLimiter, authRoutes );
// Mount user management routes
app.use( '/users', userRoutes );
// Mount places data routes
app.use( '/places', placeRoutes );
// Mount itinerary routes
app.use( '/itineraries', itineraryRoutes );
// Mount itinerary editing routes
app.use( '/itinerary-edit', require( './routes/itinerary-edit' ) );
// Mount memory/journal routes
app.use( '/memories', memoryRoutes );
// Mount ML feature routes
app.use( '/ml', mlRoutes );
// Mount export functionality routes
app.use( '/export', exportRoutes );
// Mount real-time update routes
app.use( '/realtime', realtimeRoutes );
// Mount recommendation routes
app.use( '/recommendations', require( './routes/recommendations' ) );
// Mount cleanup/maintenance routes
app.use( '/cleanup', cleanupRoutes );
// Mount flight search routes
app.use( '/flights', flightRoutes );

// --- Basic Health Check ---

// Simple endpoint to verify server is running
app.get( '/health', ( req, res ) =>
{
  res.json( { status: 'OK', timestamp: new Date().toISOString() } );
} );

// --- API Documentation ---

// Setup Swagger UI for API documentation
setupSwagger( app );

// --- Error Handling ---

// Apply global error handling middleware (must be last)
app.use( errorHandler );

// --- Database Connection ---

// Function to connect to MongoDB with graceful fallback
const connectDB = async () =>
{
  try
  {
    // Attempt connection
    await mongoose.connect( process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    } );
    logger.info( '✅ Connected to MongoDB Atlas' );
    return true; // Connection successful
  } catch ( error )
  {
    // Log failure and continue in offline mode
    logger.warn( '⚠️ MongoDB connection failed, running in offline mode:', error.message );
    logger.info( '📚 Using local data sources for places and weather' );
    return false; // Connection failed
  }
};

// --- Server Startup ---

// Function to start the server
const startServer = async () =>
{
  // Connect to database first
  const dbConnected = await connectDB();

  // Add database connection status to app locals for global access
  app.locals.dbConnected = dbConnected;

  // Start listening on the configured port
  app.listen( PORT, () =>
  {
    logger.info( `🚀 Server running on port ${ PORT }` );
    logger.info( `📊 Database: ${ dbConnected ? 'Connected' : 'Offline mode' }` );
    logger.info( `🌐 Frontend: http://localhost:3000` );
    logger.info( `📖 API Docs: http://localhost:${ PORT }/api-docs` );
  } );
};

// Execute startup only if run directly
if ( require.main === module )
{
  startServer();
}

// Export app for testing purposes
module.exports = app;