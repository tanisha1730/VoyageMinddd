const express = require( 'express' );
const router = express.Router();
const amadeusService = require( '../services/amadeusService' );
const { authenticateToken } = require( '../middleware/auth' );
const logger = require( '../utils/logger' );

/**
 * @swagger
 * /flights/search:
 *   post:
 *     summary: Search for flight offers
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - departureDate
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               departureDate:
 *                 type: string
 *                 format: date
 *               adults:
 *                 type: number
 *     responses:
 *       200:
 *         description: List of flight offers
 */
router.post( '/search', authenticateToken, async ( req, res, next ) =>
{
    try
    {
        const { origin, destination, departureDate, adults } = req.body;

        // Validate required fields
        if ( !origin || !destination || !departureDate )
        {
            return res.status( 400 ).json( {
                success: false,
                error: 'Missing required fields: origin, destination, departureDate'
            } );
        }

        logger.info( `✈️ Searching flights: ${ origin } -> ${ destination } on ${ departureDate }` );
        const flights = await amadeusService.searchFlights( {
            origin,
            destination,
            departureDate,
            adults
        } );

        res.json( {
            success: true,
            data: flights
        } );
    } catch ( error )
    {
        next( error );
    }
} );

module.exports = router;
