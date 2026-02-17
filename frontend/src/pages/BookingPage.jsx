import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { flightAPI, handleAPIError } from '../services/api';
import { format } from 'date-fns';
import { Plane, Calendar, Users, MapPin, Clock, ArrowRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingPage = () =>
{
    const location = useLocation();
    const navigate = useNavigate();
    const [ loading, setLoading ] = useState( false );
    const [ flights, setFlights ] = useState( [] );

    // Default search params or from navigation state
    const [ searchParams, setSearchParams ] = useState( {
        origin: location.state?.origin || 'NYC', // Default origin (or get from user profile)
        destination: location.state?.destination || 'LON', // Default destination
        departureDate: location.state?.date || new Date().toISOString().split( 'T' )[ 0 ],
        adults: location.state?.travelers || 1
    } );

    const [ destName, setDestName ] = useState( location.state?.destinationName || 'London' );

    useEffect( () =>
    {
        // If we have params from itinerary, verify and search immediately
        if ( location.state?.destination )
        {
            handleSearch();
        } else
        {
            // Initial mock search to show UI state
            handleSearch();
        }
    }, [] );

    const handleSearch = async () =>
    {
        // Validate date is not in the past
        const today = new Date();
        today.setHours( 0, 0, 0, 0 );
        const selectedDate = new Date( searchParams.departureDate );

        // Adjust for timezone offset if necessary, or just comparing YYYY-MM-DD strings is safer
        // Simple string comparison works for YYYY-MM-DD format
        const todayStr = new Date().toISOString().split( 'T' )[ 0 ];

        if ( searchParams.departureDate < todayStr )
        {
            toast.error( 'Cannot book flights for past dates' );
            return;
        }

        setLoading( true );
        try
        {
            const response = await flightAPI.search( searchParams );
            if ( response.data.success )
            {
                setFlights( response.data.data );
            }
        } catch ( error )
        {
            handleAPIError( error, 'Failed to find flights' );
        } finally
        {
            setLoading( false );
        }
    };

    const handleBook = ( link ) =>
    {
        window.open( link, '_blank' );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */ }
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Trip to { destName }</h1>
                    <p className="text-gray-600">Find the best flights and secure your journey.</p>
                </div>

                {/* Filter Bar (Simplified) */ }
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">From</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={ searchParams.origin }
                                    onChange={ ( e ) => setSearchParams( { ...searchParams, origin: e.target.value } ) }
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Origin City (IATA)"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">To</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={ searchParams.destination }
                                    onChange={ ( e ) => setSearchParams( { ...searchParams, destination: e.target.value } ) }
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Destination City (IATA)"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Departure</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={ searchParams.departureDate }
                                    onChange={ ( e ) => setSearchParams( { ...searchParams, departureDate: e.target.value } ) }
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <button
                            onClick={ handleSearch }
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            { loading ? <Loader className="animate-spin h-5 w-5" /> : 'Update Search' }
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Flight Lists (Left Column) */ }
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Flights</h2>

                        { loading ? (
                            <div className="text-center py-12">
                                <Loader className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
                                <p className="text-gray-500">Finding the best fares...</p>
                            </div>
                        ) : flights.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl text-center border border-gray-200">
                                <p className="text-gray-500">No flights found. Try changing dates or cities.</p>
                            </div>
                        ) : (
                            flights.map( ( flight ) => (
                                <div key={ flight.id } className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        {/* Flight Info */ }
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                                                    { flight.airlineName }
                                                </span>
                                                { flight.tags?.map( tag => (
                                                    <span key={ tag } className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                                                        { tag }
                                                    </span>
                                                ) ) }
                                            </div>
                                            <div className="flex items-center gap-8 mb-2">
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">{ format( new Date( flight.departure.at ), 'HH:mm' ) }</p>
                                                    <p className="text-sm text-gray-500">{ flight.departure.iata }</p>
                                                </div>
                                                <div className="flex-1 flex flex-col items-center">
                                                    <p className="text-xs text-gray-500 mb-1">{ flight.duration }</p>
                                                    <div className="w-24 h-px bg-gray-300 relative">
                                                        <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-gray-300"></div>
                                                        <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-gray-300"></div>
                                                    </div>
                                                    <p className="text-xs text-green-600 mt-1">{ flight.stops === 0 ? 'Non-stop' : `${ flight.stops } stops` }</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">{ format( new Date( flight.arrival.at ), 'HH:mm' ) }</p>
                                                    <p className="text-sm text-gray-500">{ flight.arrival.iata }</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price & Action */ }
                                        <div className="text-right min-w-[140px]">
                                            <div className="mb-4">
                                                <p className="text-3xl font-bold text-gray-900">${ flight.price.total }</p>
                                                <p className="text-sm text-gray-500">per person</p>
                                            </div>
                                            <button
                                                onClick={ () => handleBook( flight.bookingLink ) }
                                                className="w-full bg-[#17A2B8] text-white py-2 px-6 rounded-lg font-semibold hover:bg-[#138496] transition-colors"
                                            >
                                                Book flight
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) )
                        ) }
                    </div>

                    {/* Trip Summary (Right Column) */ }
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Summary</h3>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Travelers</span>
                                    <span className="font-medium">{ searchParams.adults } Adults</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Date</span>
                                    <span className="font-medium">{ searchParams.departureDate }</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Origin</span>
                                    <span className="font-medium">{ searchParams.origin }</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Destination</span>
                                    <span className="font-medium">{ destName }</span>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                                    <h4 className="font-semibold text-blue-900 mb-2">How booking works</h4>
                                    <ul className="space-y-2 text-xs text-blue-800 list-decimal pl-4">
                                        <li>Select your preferred flight option.</li>
                                        <li>We redirect you to the airline or trusted partner.</li>
                                        <li>Complete your payment securely on their site.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
