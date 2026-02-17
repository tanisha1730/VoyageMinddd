const logger = require( '../utils/logger' );

const errorHandler = ( error, req, res, next ) =>
{
  logger.error( 'Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get( 'User-Agent' )
  } );

  // Mongoose validation error
  if ( error.name === 'ValidationError' )
  {
    const errors = Object.values( error.errors ).map( err => ( {
      field: err.path,
      message: err.message
    } ) );

    return res.status( 400 ).json( {
      error: 'Validation failed',
      details: errors
    } );
  }

  // Mongoose duplicate key error
  if ( error.code === 11000 )
  {
    const field = Object.keys( error.keyPattern )[ 0 ];
    return res.status( 409 ).json( {
      error: 'Duplicate value',
      field,
      message: `${ field } already exists`
    } );
  }

  // Mongoose cast error
  if ( error.name === 'CastError' )
  {
    return res.status( 400 ).json( {
      error: 'Invalid ID format',
      message: 'The provided ID is not valid'
    } );
  }

  // JWT errors
  if ( error.name === 'JsonWebTokenError' )
  {
    return res.status( 401 ).json( {
      error: 'Invalid token',
      message: 'The provided token is invalid'
    } );
  }

  if ( error.name === 'TokenExpiredError' )
  {
    return res.status( 401 ).json( {
      error: 'Token expired',
      message: 'The provided token has expired'
    } );
  }
  // Mongoose connection error
  if ( error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError' )
  {
    return res.status( 503 ).json( {
      error: 'Database connection failed. Please try again later.',
      message: process.env.NODE_ENV !== 'production' ? error.message : undefined
    } );
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : error.message;

  res.status( statusCode ).json( {
    error: message,
    ...( process.env.NODE_ENV !== 'production' && { stack: error.stack } )
  } );
};

module.exports = {
  errorHandler
};