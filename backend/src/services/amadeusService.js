const Amadeus = require( 'amadeus' );
const logger = require( '../utils/logger' );

class AmadeusService
{
    constructor ()
    {
        this.amadeus = null;
        this.init();
    }

    init ()
    {
        const clientId = process.env.AMADEUS_CLIENT_ID;
        const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

        if ( clientId && clientSecret )
        {
            this.amadeus = new Amadeus( {
                clientId: clientId,
                clientSecret: clientSecret
            } );
            logger.info( '✅ Amadeus SDK initialized' );
        } else
        {
            logger.warn( '⚠️ Amadeus credentials missing. Using mock mode.' );
        }
    }

    /**
     * Search for flight offers
     * @param {Object} params Search parameters (origin, destination, date, adults)
     * @returns {Promise<Array>} List of flight offers
     */
    async searchFlights ( params )
    {
        if ( !this.amadeus )
        {
            return this.getMockFlights( params );
        }

        try
        {
            const response = await this.amadeus.shopping.flightOffersSearch.get( {
                originLocationCode: params.origin,
                destinationLocationCode: params.destination,
                departureDate: params.departureDate,
                adults: params.adults || 1,
                max: 10
            } );

            return this.processFlightOffers( response.data );
        } catch ( error )
        {
            logger.error( '❌ Amadeus API error:', error );
            return this.getMockFlights( params ); // Fallback to mock on error
        }
    }

    /**
     * Process raw Amadeus response into clean frontend-ready format
     */
    processFlightOffers ( offers )
    {
        return offers.map( offer =>
        {
            const segments = offer.itineraries[ 0 ].segments;
            const firstSegment = segments[ 0 ];
            const lastSegment = segments[ segments.length - 1 ];
            const carrierCode = firstSegment.carrierCode;

            // Calculate total duration in readable format
            const duration = offer.itineraries[ 0 ].duration.replace( 'PT', '' ).toLowerCase();

            return {
                id: offer.id,
                airline: carrierCode, // In a real app, map code to name
                airlineName: this.getAirlineName( carrierCode ),
                flightNumber: `${ carrierCode } ${ firstSegment.number }`,
                departure: {
                    iata: firstSegment.departure.iataCode,
                    at: firstSegment.departure.at,
                    terminal: firstSegment.departure.terminal
                },
                arrival: {
                    iata: lastSegment.arrival.iataCode,
                    at: lastSegment.arrival.at,
                    terminal: lastSegment.arrival.terminal
                },
                duration: duration,
                stops: segments.length - 1,
                price: {
                    total: offer.price.total,
                    currency: offer.price.currency
                },
                // Deep link for booking (Amadeus doesn't provide direct booking links in free tier usually, 
                // but we can construct a Skyscanner/Google Flights link as fallback)
                bookingLink: this.generateBookingLink( firstSegment, lastSegment )
            };
        } );
    }

    getAirlineName ( code )
    {
        const airlines = {
            'AA': 'American Airlines',
            'DL': 'Delta Air Lines',
            'UA': 'United Airlines',
            'BA': 'British Airways',
            'LH': 'Lufthansa',
            'AF': 'Air France',
            'EK': 'Emirates',
            'QR': 'Qatar Airways',
            'SQ': 'Singapore Airlines',
            'AI': 'Air India',
            '6E': 'IndiGo'
        };
        return airlines[ code ] || code;
    }

    generateBookingLink ( first, last )
    {
        // Fallback to Google Flights
        // Format: https://www.google.com/travel/flights?q=Flights%20to%20LHR%20from%20JFK%20on%202023-10-10
        const origin = first.departure.iataCode;
        const dest = last.arrival.iataCode;
        const date = first.departure.at.split( 'T' )[ 0 ];
        return `https://www.google.com/travel/flights?q=Flights%20to%20${ dest }%20from%20${ origin }%20on%20${ date }`;
    }

    getMockFlights ( params )
    {
        logger.info( '🎭 Generating mock flight data' );
        const { origin, destination, departureDate } = params;

        // Generate 3-5 mock offers
        return [
            {
                id: 'mock-1',
                airline: 'BA',
                airlineName: 'British Airways',
                flightNumber: 'BA 123',
                departure: { iata: origin || 'JFK', at: `${ departureDate }T10:00:00` },
                arrival: { iata: destination || 'LHR', at: `${ departureDate }T22:00:00` },
                duration: '7h 00m',
                stops: 0,
                price: { total: '540.00', currency: 'USD' },
                tags: [ 'Recommended', 'Best Value' ],
                bookingLink: '#'
            },
            {
                id: 'mock-2',
                airline: 'DL',
                airlineName: 'Delta Air Lines',
                flightNumber: 'DL 456',
                departure: { iata: origin || 'JFK', at: `${ departureDate }T14:30:00` },
                arrival: { iata: destination || 'LHR', at: `${ departureDate }T06:30:00` },
                duration: '8h 15m',
                stops: 1,
                price: { total: '480.00', currency: 'USD' },
                tags: [ 'Cheapest' ],
                bookingLink: '#'
            },
            {
                id: 'mock-3',
                airline: 'AF',
                airlineName: 'Air France',
                flightNumber: 'AF 789',
                departure: { iata: origin || 'JFK', at: `${ departureDate }T18:00:00` },
                arrival: { iata: destination || 'LHR', at: `${ departureDate }T08:00:00` },
                duration: '7h 45m',
                stops: 0,
                price: { total: '620.00', currency: 'USD' },
                tags: [ 'Fastest' ],
                bookingLink: '#'
            }
        ];
    }
}

module.exports = new AmadeusService();
