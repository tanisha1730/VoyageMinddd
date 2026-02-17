require( 'dotenv' ).config();
const fs = require( 'fs' );
const realDataService = require( './src/services/realDataService' );
const intelligentItineraryBuilder = require( './src/services/intelligentItineraryBuilder' );

// Setup file logging
const logStream = fs.createWriteStream( 'test_output.log', { flags: 'w' } );
const originalLog = console.log;
const originalError = console.error;

function fileLog ( ...args )
{
    const msg = args.map( a => ( typeof a === 'object' ? JSON.stringify( a, null, 2 ) : String( a ) ) ).join( ' ' );
    logStream.write( msg + '\n' );
    originalLog.apply( console, args );
}
function fileError ( ...args )
{
    const msg = args.map( a => ( typeof a === 'object' ? JSON.stringify( a, null, 2 ) : String( a ) ) ).join( ' ' );
    logStream.write( msg + '\n' );
    originalError.apply( console, args );
}

console.log = fileLog;
console.error = fileError;

async function testAhmedabad ()
{
    try
    {
        console.log( "🚀 Testing Full Itinerary Gen for Ahmedabad..." );

        // Simulating the user's request
        const destination = 'Ahmedabad';
        const interests = [ 'nature' ];
        const budget = 500;
        const days = 3;

        console.log( `Getting places for ${ destination } with interests: ${ interests.join( ',' ) }` );
        const places = await realDataService.getRealPlaces( destination, interests, 25000 );
        console.log( `\n📊 SUMMARY: Found ${ places.length } places.` );

        if ( places.length === 0 )
        {
            console.log( "❌ FAILURE: No places returned from RealDataService." );
            return;
        }

        console.log( "Categorizing places..." );
        const categorized = intelligentItineraryBuilder.categorizePlaces( places );
        console.log( "Categories:", {
            attractions: categorized.attractions.length,
            nature: categorized.nature.length,
            shopping: categorized.shopping.length,
            viewpoints: categorized.viewpoints.length,
            restaurants: categorized.restaurants.length
        } );

        console.log( "\nAttempting to build itinerary..." );
        try
        {
            const itinerary = intelligentItineraryBuilder.buildItinerary(
                destination,
                days,
                budget,
                interests,
                places
            );
            console.log( `\n✅ Itinerary built! Days: ${ itinerary.length }` );
            itinerary.forEach( day =>
            {
                console.log( `Day ${ day.day }: ${ day.places.length } places` );
                day.places.forEach( p => console.log( `  - ${ p.activity_type }: ${ p.name }` ) );
            } );
        } catch ( e )
        {
            console.error( "❌ BuildItinerary Failed:", e );
        }

    } catch ( error )
    {
        console.error( "❌ ERROR during generation:", error );
    }
}

testAhmedabad();
