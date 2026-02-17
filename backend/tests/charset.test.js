const request = require( 'supertest' );
const app = require( '../src/server' );

describe( 'Charset Compatibility', () =>
{
    it( 'should handle Content-Type with quoted "UTF-8" charset', async () =>
    {
        // We expect a 401 because credentials are wrong, but NOT a charset error
        // If charset is unsupported, body-parser usually throws 415 or 400
        const res = await request( app )
            .post( '/auth/login' )
            .set( 'Content-Type', 'application/json; charset="UTF-8"' )
            .send( {
                email: 'test@example.com',
                password: 'wrongpassword'
            } );

        if ( res.body && res.body.error && res.body.error.includes( 'unsupported charset' ) )
        {
            throw new Error( `Server returned charset error: ${ JSON.stringify( res.body ) }` );
        }

        // Expecting 401 Invalid Credentials, meaning it PARSED the body successfully
        expect( res.status ).toBe( 401 );
    } );

    it( 'should handle Content-Type with unquoted UTF-8 charset', async () =>
    {
        const res = await request( app )
            .post( '/auth/login' )
            .set( 'Content-Type', 'application/json; charset=UTF-8' )
            .send( {
                email: 'test@example.com',
                password: 'wrongpassword'
            } );

        expect( res.status ).toBe( 401 );
    } );

    it( 'should handle Content-Type with single quoted "UTF-8" charset', async () =>
    {
        const res = await request( app )
            .post( '/auth/login' )
            .set( 'Content-Type', "application/json; charset='UTF-8'" )
            .send( {
                email: 'test@example.com',
                password: 'wrongpassword'
            } );
        expect( res.status ).toBe( 401 );
    } );

    it( 'should handle Content-Type with spaces around charset', async () =>
    {
        const res = await request( app )
            .post( '/auth/login' )
            .set( 'Content-Type', 'application/json; charset = "UTF-8"' )
            .send( {
                email: 'test@example.com',
                password: 'wrongpassword'
            } );
        expect( res.status ).toBe( 401 );
    } );
} );
