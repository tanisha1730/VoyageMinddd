// Real-time ML service integration — no database used.
const axios = require( 'axios' );
const logger = require( '../utils/logger' );

const ML_BASE_URL = process.env.ML_BASE_URL || 'http://localhost:8000';

// Configure axios with timeout
const mlClient = axios.create( {
  baseURL: ML_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
} );

class MLService
{
  /**
   * Parse natural language travel query
   * @param {string} text - Natural language query
   * @returns {Promise<Object>} Parsed travel information
   */
  async parseNLP ( text )
  {
    try
    {
      logger.info( `🧠 Parsing NLP query: ${ text }` );
      const response = await mlClient.post( '/nlp/parse', { text } );
      logger.info( `✅ NLP parsed successfully` );
      return response.data;
    } catch ( error )
    {
      logger.error( '❌ NLP parsing failed:', error.message );
      // Fallback parsing
      return this.fallbackNLPParse( text );
    }
  }

  /**
   * Get ML-powered place recommendations
   * @param {Object} preferences - User preferences
   * @param {string} destination - Destination name
   * @param {Array} poiCandidates - Array of POI candidates
   * @returns {Promise<Array>} Ranked recommendations
   */
  async getRecommendations ( preferences, destination, poiCandidates )
  {
    try
    {
      logger.info( `🎯 Getting recommendations for ${ destination }` );
      const response = await mlClient.post( '/recommend', {
        preferences,
        destination,
        poi_candidates: poiCandidates
      } );
      logger.info( `✅ Got ${ response.data.length } recommendations` );
      return response.data;
    } catch ( error )
    {
      logger.error( '❌ Recommendation failed:', error.message );
      // Return candidates sorted by popularity
      return poiCandidates
        .sort( ( a, b ) => ( b.popularity || 0 ) - ( a.popularity || 0 ) )
        .map( poi => ( {
          name: poi.name,
          score: ( poi.popularity || 3.0 ) / 5.0,
          tags: poi.tags || []
        } ) );
    }
  }

  /**
   * Optimize itinerary using ML
   * @param {Array} poiList - List of POIs with coordinates
   * @param {number} days - Number of days
   * @param {number} dailyTimeBudget - Hours per day
   * @returns {Promise<Object>} Optimized itinerary plan
   */
  async optimizeItinerary ( poiList, days, dailyTimeBudget = 8 )
  {
    try
    {
      logger.info( `⚡ Optimizing itinerary for ${ days } days` );
      const response = await mlClient.post( '/optimize', {
        poi_list: poiList,
        days,
        daily_time_budget: dailyTimeBudget
      } );
      logger.info( `✅ Itinerary optimized successfully` );
      return response.data;
    } catch ( error )
    {
      logger.error( '❌ Optimization failed:', error.message );
      // Fallback optimization
      return this.fallbackOptimize( poiList, days );
    }
  }

  /**
   * Adjust itinerary based on weather
   * @param {Array} plan - Current itinerary plan
   * @param {Array} weather - Weather forecast
   * @returns {Promise<Object>} Weather-adjusted plan
   */
  async adjustForWeather ( plan, weather )
  {
    try
    {
      logger.info( `🌦️ Adjusting itinerary for weather` );
      const response = await mlClient.post( '/weather-adjust', {
        plan,
        weather
      } );
      logger.info( `✅ Weather adjustment completed` );
      return response.data;
    } catch ( error )
    {
      logger.error( '❌ Weather adjustment failed:', error.message );
      // Return original plan with warning
      return {
        plan,
        notes: [ 'Weather adjustment service unavailable' ]
      };
    }
  }

  /**
   * Generate text based on prompt
   * @param {string} prompt - Text generation prompt
   * @returns {Promise<Object>} Generated text
   */
  async generateText ( prompt )
  {
    try
    {
      logger.info( `📝 Generating text from prompt` );
      const response = await mlClient.post( '/generate-text', { prompt } );
      logger.info( `✅ Text generated successfully` );
      return response.data;
    } catch ( error )
    {
      logger.error( '❌ Text generation failed:', error.message );
      
      // Dynamic fallback based on prompt extraction
      const text = prompt.toLowerCase();
      const titleMatch = prompt.match( /Trip:\s*(.+?)(?:\n|$)/i );
      const highlightMatch = prompt.match( /Highlight:\s*(.+?)(?:\n|$)/i );
      
      const title = titleMatch ? titleMatch[ 1 ].trim() : 'the trip';
      const highlight = highlightMatch ? highlightMatch[ 1 ].trim() : 'every moment was a discovery';
      
      return {
        text: `${ highlight }. Our journey through ${ title } was filled with unexpected delights. From the golden sunrise to the vibrant streets, every moment felt like a discovery. We wandered through ancient paths, tasted local flavors that danced on our tongues, and met people whose smiles were as warm as the afternoon sun. It wasn't just a trip; it was a collection of beautiful memories woven together in ${ title }.`
      };
    }
  }

  /**
   * Generate postcard caption
   * @param {string} poi - POI name
   * @param {string} date - Date string
   * @param {string} weather - Weather condition
   * @returns {Promise<Object>} Generated caption
   */
  async generateCaption ( poi, date, weather )
  {
    try
    {
      logger.info( `📸 Generating caption for ${ poi }` );
      const response = await mlClient.post( '/postcard/caption', {
        poi,
        date,
        weather
      } );
      logger.info( `✅ Caption generated successfully` );
      return response.data;
    } catch ( error )
    {
      logger.error( '❌ Caption generation failed:', error.message );
      // Fallback caption
      return {
        caption: `Amazing memories at ${ poi }! 🌟`
      };
    }
  }

  /**
   * Check if ML service is available
   * @returns {Promise<boolean>} Service availability
   */
  async isAvailable ()
  {
    try
    {
      const response = await mlClient.get( '/', { timeout: 3000 } );
      return response.status === 200;
    } catch ( error )
    {
      return false;
    }
  }

  // Fallback methods for when ML service is unavailable

  fallbackNLPParse ( text )
  {
    const textLower = text.toLowerCase();

    let destination = 'Unknown';

    // FIXED: Better destination extraction patterns
    const destinationPatterns = [
      // "for Ahmedabad", "to Paris", "in Tokyo"
      /(?:for|to|in|visit|explore|go to|travel to|trip to)\s+([A-Z][a-zA-Z\s,.-]+?)(?:\s+for\s+\d|\s+with|\s+under|\s+budget|$)/i,
      // "itinerary for Ahmedabad"
      /itinerary\s+for\s+([A-Z][a-zA-Z\s,.-]+?)(?:\s+for\s+\d|\s+with|\s+under|\s+budget|$)/i,
      // "plan trip to Paris"
      /plan.*?(?:trip|travel|vacation|holiday).*?(?:to|in|for)\s+([A-Z][a-zA-Z\s,.-]+?)(?:\s+for\s+\d|\s+with|\s+under|\s+budget|$)/i,
      // "visit Tokyo for 5 days"
      /(?:visit|explore)\s+([A-Z][a-zA-Z\s,.-]+?)(?:\s+for\s+\d|\s+with|\s+under|\s+budget|$)/i
    ];

    // Try pattern matching to extract any destination
    for ( const pattern of destinationPatterns )
    {
      const match = text.match( pattern );
      if ( match && match[ 1 ] )
      {
        let candidate = match[ 1 ].trim();

        // Clean up the candidate
        candidate = candidate.replace( /\b(for|with|budget|days?|day|weeks?|week)\b.*$/i, '' ).trim();
        candidate = candidate.replace( /[,.-]+$/, '' ).trim(); // Remove trailing punctuation

        if ( candidate.length > 2 && candidate.length < 50 )
        { // Reasonable destination name length
          destination = candidate.split( ' ' )
            .map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ).toLowerCase() )
            .join( ' ' );
          break;
        }
      }
    }

    // If still unknown, try to find any proper noun that could be a place
    if ( destination === 'Unknown' )
    {
      const words = text.split( /\s+/ );
      for ( let i = 0; i < words.length; i++ )
      {
        const word = words[ i ].replace( /[^a-zA-Z]/g, '' );
        // Look for capitalized words that could be place names
        if ( word.length > 2 && /^[A-Z][a-z]+$/.test( word ) )
        {
          // Check if it's not a common word
          const commonWords = [ 'Plan', 'Trip', 'Travel', 'Visit', 'Days', 'Budget', 'For', 'With', 'The', 'And', 'Or' ];
          if ( !commonWords.includes( word ) )
          {
            destination = word;
            break;
          }
        }
      }
    }

    // Simple days extraction
    const daysMatch = textLower.match( /(\d+)\s*days?/ );
    const days = daysMatch ? parseInt( daysMatch[ 1 ] ) : 3;

    // Enhanced budget extraction - supports $, ₹, Rs, and plain numbers
    const budgetPatterns = [
      /\$\s*(\d+(?:,\d+)*)/,           // $2000
      /₹\s*(\d+(?:,\d+)*)/,            // ₹20000
      /rs\.?\s*(\d+(?:,\d+)*)/i,       // Rs 20000 or rs 20000
      /budget\s+(?:of\s+)?(\d+(?:,\d+)*)/i,  // budget 2000 or budget of 2000
      /(\d+(?:,\d+)*)\s*(?:dollars?|usd)/i   // 2000 dollars
    ];

    let budget = 10000; // Default
    for ( const pattern of budgetPatterns )
    {
      const match = text.match( pattern );
      if ( match && match[ 1 ] )
      {
        budget = parseFloat( match[ 1 ].replace( /,/g, '' ) );
        break;
      }
    }

    // Enhanced interests extraction
    const interestKeywords = {
      'food': [ 'food', 'cuisine', 'restaurant', 'dining', 'culinary', 'eat', 'taste', 'local food', 'street food', 'fine dining' ],
      'culture': [ 'culture', 'cultural', 'tradition', 'local', 'heritage', 'customs', 'authentic', 'traditional' ],
      'history': [ 'history', 'historical', 'ancient', 'heritage', 'monument', 'museum', 'archaeological', 'historic' ],
      'art': [ 'art', 'museum', 'gallery', 'painting', 'sculpture', 'artistic', 'exhibitions' ],
      'nature': [ 'nature', 'park', 'wildlife', 'natural', 'scenic', 'landscape', 'outdoor', 'gardens' ],
      'beach': [ 'beach', 'sea', 'ocean', 'coastal', 'seaside', 'waterfront', 'marine' ],
      'adventure': [ 'adventure', 'trekking', 'sports', 'hiking', 'climbing', 'extreme', 'activities' ],
      'nightlife': [ 'nightlife', 'party', 'club', 'bars', 'entertainment', 'music', 'dancing' ],
      'shopping': [ 'shopping', 'market', 'boutique', 'mall', 'souvenir', 'retail', 'stores' ],
      'architecture': [ 'architecture', 'building', 'cathedral', 'temple', 'palace', 'monuments', 'structures' ],
      'famous': [ 'famous', 'iconic', 'landmark', 'must-see', 'popular', 'well-known', 'tourist', 'attractions' ],
      'romantic': [ 'romantic', 'couple', 'honeymoon', 'intimate', 'cozy', 'love', 'romance' ],
      'luxury': [ 'luxury', 'premium', 'high-end', 'exclusive', 'upscale', 'deluxe', 'fancy' ],
      'budget': [ 'budget', 'cheap', 'affordable', 'low-cost', 'economical', 'inexpensive' ]
    };

    const interests = [];
    for ( const [ interest, keywords ] of Object.entries( interestKeywords ) )
    {
      if ( keywords.some( keyword => textLower.includes( keyword ) ) )
      {
        interests.push( interest );
      }
    }

    return {
      destination,
      days,
      budget,
      interests,
      confidence: {
        destination: destination !== 'Unknown' ? 0.8 : 0.3,
        days: daysMatch ? 0.9 : 0.5,
        budget: budget !== 10000 ? 0.9 : 0.3 // High confidence if budget was parsed (not default)
      }
    };
  }

  fallbackOptimize ( poiList, days )
  {
    const plan = [];
    const poisPerDay = Math.max( 1, Math.ceil( poiList.length / days ) );

    for ( let day = 1; day <= days; day++ )
    {
      const startIdx = ( day - 1 ) * poisPerDay;
      const endIdx = Math.min( startIdx + poisPerDay, poiList.length );
      const dayPois = poiList.slice( startIdx, endIdx );

      const places = dayPois.map( ( poi, index ) =>
      {
        const startHour = 10 + ( index * 2 );
        return {
          name: poi.name,
          lat: poi.lat || 0,
          lng: poi.lng || 0,
          start_time: `${ startHour.toString().padStart( 2, '0' ) }:00`,
          end_time: `${ ( startHour + 2 ).toString().padStart( 2, '0' ) }:00`
        };
      } );

      if ( places.length > 0 )
      {
        plan.push( { day, places } );
      }
    }

    return { plan };
  }
}

module.exports = new MLService();