require( 'dotenv' ).config( { path: '../.env' } );
const mongoose = require( 'mongoose' );
const User = require( '../src/models/User' );
const bcrypt = require( 'bcryptjs' );

const checkUser = async () =>
{
    try
    {
        console.log( 'Connecting to MongoDB...' );
        await mongoose.connect( process.env.MONGO_URI );
        console.log( 'Connected.' );

        const email = 'tanishabhalgamia@gmail.com';
        const password = 'password123';

        console.log( `Checking user: ${ email }` );
        const user = await User.findOne( { email } );

        if ( !user )
        {
            console.log( '❌ User NOT found.' );
        } else
        {
            console.log( '✅ User found.' );
            console.log( 'ID:', user._id );
            console.log( 'Password Hash:', user.password_hash );

            const isMatch = await bcrypt.compare( password, user.password_hash );
            if ( isMatch )
            {
                console.log( '✅ Password "password123" MATCHES.' );
            } else
            {
                console.log( '❌ Password "password123" does NOT match.' );

                // Optional: Reset password for debugging
                // console.log('Resetting password to "password123"...');
                // user.password_hash = password; // Middleware will hash this
                // await user.save();
                // console.log('✅ Password reset.');
            }
        }

        mongoose.disconnect();
    } catch ( error )
    {
        console.error( 'Error:', error );
        process.exit( 1 );
    }
};

checkUser();
