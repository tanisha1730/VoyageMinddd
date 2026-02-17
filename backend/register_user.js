const mongoose = require( 'mongoose' );
const User = require( './src/models/User' ); // Adjust path as needed
require( 'dotenv' ).config();

async function registerUser ()
{
    try
    {
        await mongoose.connect( process.env.MONGO_URI );
        console.log( '✅ Connected to MongoDB' );

        const email = 'tanishabhalgamia@gmail.com';
        const password = 'password123'; // Default password
        const name = 'Tanisha Bhalgamia';

        // Check if user exists
        const existingUser = await User.findOne( { email } );
        if ( existingUser )
        {
            console.log( '⚠️ User already exists. Updating password...' );
            existingUser.password_hash = password; // Pre-save hook will hash this
            await existingUser.save();
            console.log( '✅ Password updated to: password123' );
        } else
        {
            console.log( 'ℹ️ Creating new user...' );
            const user = new User( {
                name,
                email,
                password_hash: password,
                preferences: { budget: 'medium', interests: [ 'travel' ] }
            } );
            await user.save();
            console.log( '✅ User created successfully!' );
        }

        console.log( '-----------------------------------' );
        console.log( '📧 Email: ' + email );
        console.log( '🔑 Password: ' + password );
        console.log( '-----------------------------------' );

        process.exit( 0 );
    } catch ( error )
    {
        console.error( '❌ Error:', error );
        process.exit( 1 );
    }
}

registerUser();
