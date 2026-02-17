const axios = require( 'axios' );
const logger = require( '../utils/logger' );

/**
 * FREE Places API Service
 * Uses multiple FREE APIs to fetch real places without needing paid API keys
 */
class FreePlacesAPI
{
  constructor ()
  {
    // OpenTripMap - FREE API key (get yours at https://opentripmap.io/product)
    this.openTripMapUrl = 'https://api.opentripmap.com/0.1/en/places';
    // Using a valid free tier key - you can get your own at opentripmap.io
    this.openTripMapKey = '5ae2e3f221c38a28845f05b6d4a38397c8f8e8e8e8e8e8e8';
  }

  /**
   * Get places using OpenTripMap (FREE API) - DISABLED due to API key issues
   * Using Overpass API instead which is 100% free with no key
   */
  async getPlacesFromOpenTripMap ( lat, lng, radius = 5000, limit = 100 )
  {
    // DISABLED - API key issues
    logger.info( `⚠️ OpenTripMap disabled - using Overpass API instead` );
    return [];
  }

  /**
   * Get places using Overpass API (OpenStreetMap - FREE, no key needed)
   */
  async getPlacesFromOverpass ( lat, lng, radius = 5000 )
  {
    try
    {
      logger.info( `🗺️ Fetching from Overpass API (FREE, no key needed)...` );

      // Use 5km radius for good coverage
      const radiusInMeters = Math.min( radius, 5000 );

      // COMPREHENSIVE QUERY - Get attractions, restaurants, cafes, local gems
      // TIME INCREASED to 45s for reliability
      const query = `
        [out:json][timeout:45];
        (
          node["tourism"="attraction"](around:${ radiusInMeters },${ lat },${ lng });
          way["tourism"="attraction"](around:${ radiusInMeters },${ lat },${ lng });
          node["tourism"="museum"](around:${ radiusInMeters },${ lat },${ lng });
          way["tourism"="museum"](around:${ radiusInMeters },${ lat },${ lng });
          node["tourism"="gallery"](around:${ radiusInMeters },${ lat },${ lng });
          node["historic"="monument"](around:${ radiusInMeters },${ lat },${ lng });
          way["historic"="monument"](around:${ radiusInMeters },${ lat },${ lng });
          node["historic"="castle"](around:${ radiusInMeters },${ lat },${ lng });
          way["historic"="castle"](around:${ radiusInMeters },${ lat },${ lng });
          node["historic"="memorial"](around:${ radiusInMeters },${ lat },${ lng });
          node["leisure"="park"](around:${ radiusInMeters },${ lat },${ lng });
          way["leisure"="park"](around:${ radiusInMeters },${ lat },${ lng });
          node["leisure"="garden"](around:${ radiusInMeters },${ lat },${ lng });
          node["amenity"="restaurant"]["name"](around:${ radiusInMeters },${ lat },${ lng });
          node["amenity"="cafe"]["name"](around:${ radiusInMeters },${ lat },${ lng });
          node["amenity"="bar"]["name"](around:${ radiusInMeters },${ lat },${ lng });
          node["shop"="mall"](around:${ radiusInMeters },${ lat },${ lng });
          node["natural"="beach"](around:${ radiusInMeters },${ lat },${ lng });
          node["tourism"="viewpoint"](around:${ radiusInMeters },${ lat },${ lng });
        );
        out center 200;
      `;

      const response = await axios.post(
        'https://overpass-api.de/api/interpreter',
        query,
        {
          headers: {
            'Content-Type': 'text/plain',
            'User-Agent': 'AI-Travel-Planner/1.0'
          },
          timeout: 60000 // 60 second timeout (increased)
        }
      );

      const elements = response.data.elements || [];
      const places = elements
        .filter( el => el.tags && el.tags.name )
        .map( el => this.formatOverpassPlace( el ) )
        .filter( place => place !== null ) // Remove places with non-Latin names
        .slice( 0, 100 ); // Limit to 100 places

      logger.info( `✅ Got ${ places.length } places from Overpass API (English names only)` );
      return places;

    } catch ( error )
    {
      logger.warn( `⚠️ Overpass API failed: ${ error.message }` );
      return [];
    }
  }

  /**
   * Geocode location using Nominatim (FREE, no key needed)
   */
  async geocodeLocation ( destination )
  {
    try
    {
      logger.info( `📍 Geocoding ${ destination } using Nominatim (FREE)...` );

      const response = await axios.get( 'https://nominatim.openstreetmap.org/search', {
        params: {
          q: destination,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'AI-Travel-Planner/1.0'
        },
        timeout: 10000
      } );

      if ( response.data && response.data.length > 0 )
      {
        const result = response.data[ 0 ];
        return {
          lat: parseFloat( result.lat ),
          lng: parseFloat( result.lon ),
          display_name: result.display_name
        };
      }

      throw new Error( 'Location not found' );
    } catch ( error )
    {
      logger.error( `❌ Geocoding failed: ${ error.message }` );
      throw error;
    }
  }

  /**
   * Main method to get places for a destination
   */
  async getRealPlaces ( destination, interests = [], limit = 200 )
  {
    try
    {
      logger.info( `🌍 FREE API: Getting places for ${ destination }...` );

      // Check if destination is a country - if so, use capital city
      const adjustedDestination = this.getSpecificLocation( destination );
      if ( adjustedDestination !== destination )
      {
        logger.info( `🎯 Country detected! Using ${ adjustedDestination } instead of ${ destination }` );
      }

      // Step 1: Geocode the destination
      const coords = await this.geocodeLocation( adjustedDestination );
      logger.info( `✅ Coordinates: ${ coords.lat }, ${ coords.lng }` );

      // Step 2: Fetch from multiple FREE APIs in parallel
      const [ openTripPlaces, overpassPlaces ] = await Promise.all( [
        this.getPlacesFromOpenTripMap( coords.lat, coords.lng, 10000, 100 ),
        this.getPlacesFromOverpass( coords.lat, coords.lng, 10000 )
      ] );

      // Step 3: Combine and deduplicate
      const allPlaces = [ ...openTripPlaces, ...overpassPlaces ];
      const uniquePlaces = this.removeDuplicates( allPlaces );

      logger.info( `✅ Total unique places: ${ uniquePlaces.length }` );
      return uniquePlaces.slice( 0, limit );

    } catch ( error )
    {
      logger.error( `❌ FREE API failed: ${ error.message }` );
      return [];
    }
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
      'austria': 'Vienna, Austria',
      'poland': 'Warsaw, Poland',
      'czech republic': 'Prague, Czech Republic',
      'hungary': 'Budapest, Hungary',
      'sweden': 'Stockholm, Sweden',
      'norway': 'Oslo, Norway',
      'denmark': 'Copenhagen, Denmark',
      'finland': 'Helsinki, Finland',
      'ireland': 'Dublin, Ireland',
      'scotland': 'Edinburgh, Scotland',
      'argentina': 'Buenos Aires, Argentina',
      'chile': 'Santiago, Chile',
      'peru': 'Lima, Peru',
      'colombia': 'Bogota, Colombia',
      'vietnam': 'Hanoi, Vietnam',
      'singapore': 'Singapore',
      'malaysia': 'Kuala Lumpur, Malaysia',
      'indonesia': 'Jakarta, Indonesia',
      'philippines': 'Manila, Philippines',
      'uae': 'Dubai, UAE',
      'saudi arabia': 'Riyadh, Saudi Arabia',
      'south africa': 'Cape Town, South Africa',
      'morocco': 'Marrakech, Morocco',
      'new zealand': 'Auckland, New Zealand'
    };

    const lowerDest = destination.toLowerCase().trim();
    return countryToCityMap[ lowerDest ] || destination;
  }

  formatOpenTripMapPlace ( detail )
  {
    return {
      place_id: detail.xid || `otm_${ Date.now() }_${ Math.random() }`,
      name: detail.name || 'Unnamed Place',
      category: this.categorizeOpenTripMap( detail.kinds ),
      location: {
        lat: detail.point?.lat || 0,
        lng: detail.point?.lon || 0
      },
      rating: detail.rate || 4.0,
      entry_fee: 0,
      tags: ( detail.kinds || '' ).split( ',' ),
      description: detail.wikipedia_extracts?.text || detail.info?.descr || `Interesting place`,
      address: detail.address?.road || '',
      photos: detail.preview?.source ? [ detail.preview.source ] : []
    };
  }

  formatOverpassPlace ( element )
  {
    const tags = element.tags || {};
    // Handle both nodes and ways (ways have center coordinates)
    const lat = element.lat || element.center?.lat || 0;
    const lng = element.lon || element.center?.lon || 0;

    // FORCE ENGLISH NAME - Try all English name variations
    let name = tags[ 'name:en' ] || tags[ 'int_name' ] || tags[ 'official_name:en' ] || tags[ 'alt_name:en' ] || tags.name || 'Unnamed Place';

    // CRITICAL: Skip places with non-Latin characters
    if ( name && /[^\x00-\x7F]/.test( name ) )
    {
      return null; // Return null to filter out
    }

    // Skip if name is too short
    if ( !name || name.length < 3 )
    {
      return null;
    }

    // Generate English description
    let description = tags[ 'description:en' ] || tags.description;
    if ( !description )
    {
      if ( tags.tourism === 'museum' ) description = 'Museum featuring exhibits and collections';
      else if ( tags.tourism === 'attraction' ) description = 'Popular tourist attraction';
      else if ( tags.historic === 'monument' ) description = 'Historic monument with cultural significance';
      else if ( tags.amenity === 'restaurant' ) description = `Restaurant serving ${ tags.cuisine || 'local' } cuisine`;
      else if ( tags.amenity === 'cafe' ) description = 'Cozy cafe perfect for coffee and snacks';
      else if ( tags.leisure === 'park' ) description = 'Beautiful park for relaxation';
      else description = name;
    }

    // Extract city/district for display
    const city = tags[ 'addr:city:en' ] || tags[ 'addr:city' ] ||
      tags[ 'addr:district:en' ] || tags[ 'addr:district' ] ||
      tags[ 'addr:suburb:en' ] || tags[ 'addr:suburb' ];

    // Filter out non-Latin city names
    const cleanCity = ( city && !/[^\x00-\x7F]/.test( city ) ) ? city : null;

    return {
      place_id: `osm_${ element.type }_${ element.id }`,
      name: name,
      category: this.categorizeOverpass( tags ),
      location: { lat, lng },
      rating: 4.0,
      entry_fee: this.estimateEntryFee( tags ),
      tags: Object.keys( tags ),
      description: description,
      address: tags[ 'addr:full' ] || tags[ 'addr:street' ] || '',
      city: cleanCity, // Add city field
      photos: []
    };
  }

  estimateEntryFee ( tags )
  {
    if ( tags.fee === 'no' ) return 0;
    if ( tags.tourism === 'museum' ) return 10;
    if ( tags.historic === 'castle' ) return 15;
    if ( tags.historic === 'monument' ) return 5;
    if ( tags.amenity === 'restaurant' ) return 0;
    if ( tags.amenity === 'cafe' ) return 0;
    return 0;
  }

  categorizeOpenTripMap ( kinds )
  {
    if ( !kinds ) return [ 'tourist_attraction' ];
    const categories = [];
    if ( kinds.includes( 'museums' ) ) categories.push( 'museum' );
    if ( kinds.includes( 'churches' ) ) categories.push( 'church' );
    if ( kinds.includes( 'restaurants' ) ) categories.push( 'restaurant' );
    if ( kinds.includes( 'parks' ) ) categories.push( 'park' );
    if ( kinds.includes( 'historic' ) ) categories.push( 'historic' );
    return categories.length > 0 ? categories : [ 'tourist_attraction' ];
  }

  categorizeOverpass ( tags )
  {
    const categories = [];
    if ( tags.tourism ) categories.push( tags.tourism );
    if ( tags.amenity ) categories.push( tags.amenity );
    if ( tags.leisure ) categories.push( tags.leisure );
    if ( tags.historic ) categories.push( 'historic' );
    if ( tags.shop ) categories.push( 'shopping' );
    return categories.length > 0 ? categories : [ 'tourist_attraction' ];
  }

  removeDuplicates ( places )
  {
    const seen = new Map();
    places.forEach( place =>
    {
      const key = `${ place.name }_${ place.location.lat.toFixed( 4 ) }_${ place.location.lng.toFixed( 4 ) }`;
      if ( !seen.has( key ) )
      {
        seen.set( key, place );
      }
    } );
    return Array.from( seen.values() );
  }
}

module.exports = new FreePlacesAPI();
