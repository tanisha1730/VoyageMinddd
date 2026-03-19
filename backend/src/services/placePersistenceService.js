const Place = require( '../models/Place' );
const logger = require( '../utils/logger' );

class PlacePersistenceService
{
    /**
     * Upsert a list of places into the database
     * @param {Array} places - Array of formatted place objects
     * @param {String} city - Optional city to assign to places
     * @param {String} country - Optional country to assign to places
     */
    async upsertPlaces ( places, city, country )
    {
        if ( !places || !Array.isArray( places ) || places.length === 0 )
        {
            return [];
        }

        const savedPlaces = [];
        const stats = { new: 0, updated: 0, failed: 0 };

        for ( const placeData of places )
        {
            try
            {
                if ( !placeData.place_id || !placeData.name )
                {
                    stats.failed++;
                    continue;
                }

                // Prepare data for MongoDB
                const updateData = {
                    name: placeData.name,
                    category: Array.isArray( placeData.category ) ? placeData.category : [ placeData.category ].filter( Boolean ),
                    location: placeData.location,
                    rating: placeData.rating || 0,
                    entry_fee: placeData.entry_fee || 0,
                    tags: Array.isArray( placeData.tags ) ? placeData.tags : [],
                    description: placeData.description || '',
                    image_url: placeData.image_url || ( placeData.photos?.[ 0 ] ) || '',
                    last_updated: new Date()
                };

                // Handle city/country
                if ( city ) updateData.city = city;
                if ( country ) updateData.country = country;

                // If city/country are missing but required, try to infer from address or just use destination
                if ( !updateData.city && placeData.address )
                {
                    // Very basic inference, could be improved
                    const parts = placeData.address.split( ',' );
                    if ( parts.length > 1 )
                    {
                        updateData.city = parts[ parts.length - 2 ].trim();
                    }
                }

                // Ensure city and country are present as they are required in the model
                if ( !updateData.city ) updateData.city = city || 'Unknown';
                if ( !updateData.country ) updateData.country = country || 'Unknown';

                // Upsert
                const result = await Place.findOneAndUpdate(
                    { place_id: placeData.place_id },
                    { $set: updateData },
                    {
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true,
                        runValidators: true
                    }
                );

                savedPlaces.push( result );

                // Check if it was an insert or update (Mongoose-specific check might vary)
                // For simplicity, we'll just increment based on successful operation
                stats.new++;
            } catch ( error )
            {
                logger.error( `Failed to upsert place ${ placeData.name }:`, error.message );
                stats.failed++;
            }
        }

        logger.info( `Places persistence complete: ${ stats.new } processed, ${ stats.failed } failed` );
        return savedPlaces;
    }

    /**
     * Save a single place to the database
     * @param {Object} placeData - Formatted place object
     */
    async savePlace ( placeData )
    {
        try
        {
            const result = await this.upsertPlaces( [ placeData ] );
            return result[ 0 ];
        } catch ( error )
        {
            logger.error( `Failed to save place ${ placeData.name }:`, error.message );
            return null;
        }
    }
}

module.exports = new PlacePersistenceService();
