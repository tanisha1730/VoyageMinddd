require( 'dotenv' ).config();
const mongoose = require( 'mongoose' );
const Place = require( './backend/src/models/Place' );
const placePersistenceService = require( './backend/src/services/placePersistenceService' );

async function verify ()
{
    try
    {
        console.log( 'Connecting to MongoDB...' );
        await mongoose.connect( process.env.MONGODB_URI );
        console.log( 'Connected!' );

        const testPlace = {
            place_id: 'test_place_' + Date.now(),
            name: 'Persistence Test Place',
            location: { lat: 48.8566, lng: 2.3522 },
            category: [ 'test' ],
            rating: 5,
            description: 'A place created to test persistence logic.',
            address: '123 Persistence St, Paris, France',
            tags: [ 'test', 'persistence' ]
        };

        console.log( 'Saving test place...' );
        await placePersistenceService.savePlace( testPlace );
        console.log( 'Place saved.' );

        console.log( 'Verifying in database...' );
        const dbPlace = await Place.findOne( { place_id: testPlace.place_id } );

        if ( dbPlace )
        {
            console.log( '✅ Success! Found place in DB:', dbPlace.name );
            console.log( 'City inferred:', dbPlace.city );
            console.log( 'Country inferred:', dbPlace.country );

            // Cleanup
            await Place.deleteOne( { place_id: testPlace.place_id } );
            console.log( 'Cleanup complete.' );
        } else
        {
            console.error( '❌ Failure! Place not found in DB.' );
        }

    } catch ( error )
    {
        console.error( 'Verification error:', error );
    } finally
    {
        await mongoose.disconnect();
        console.log( 'Disconnected.' );
    }
}

verify();
