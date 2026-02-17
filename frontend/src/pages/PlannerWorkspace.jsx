import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { itineraryAPI, realtimeAPI, exportAPI, handleAPIError } from '../services/api'
import { Sparkles, MapPin, Calendar, DollarSign, Users, Save, Download, User, FileText, BookOpen, Menu, X } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import TravelLoadingAnimation from '../components/TravelLoadingAnimation'
import toast from 'react-hot-toast'
import localStorageService from '../services/localStorageService'

import MapComponent from '../components/MapComponent'

const PlannerWorkspace = () =>
{
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [ activeTab, setActiveTab ] = useState( 'itinerary' ) // 'itinerary' or 'map'

  const [ itinerary, setItinerary ] = useState( null )
  const [ formData, setFormData ] = useState( {
    destination: '',
    dates: '',
    budget: '',
    travelStyle: 'Balanced',
    interests: ''
  } )
  const [ loading, setLoading ] = useState( false )
  const [ generating, setGenerating ] = useState( false )
  const [ daysError, setDaysError ] = useState( '' )
  const [ mobileMenuOpen, setMobileMenuOpen ] = useState( false )

  // Load saved state from localStorage on mount
  useEffect( () =>
  {
    const savedState = localStorage.getItem( 'plannerState' )
    if ( savedState )
    {
      try
      {
        const { formData: savedFormData, itinerary: savedItinerary } = JSON.parse( savedState )
        if ( savedFormData ) setFormData( savedFormData )
        if ( savedItinerary ) setItinerary( savedItinerary )
      } catch ( error )
      {
        console.error( 'Failed to load planner state:', error )
      }
    }
  }, [] )

  // Save state to localStorage whenever it changes
  useEffect( () =>
  {
    if ( formData.destination || itinerary )
    {
      localStorage.setItem( 'plannerState', JSON.stringify( { formData, itinerary } ) )
    }
  }, [ formData, itinerary ] )

  useEffect( () =>
  {
    if ( location.state?.parsedData )
    {
      const parsed = location.state.parsedData
      setFormData( {
        ...formData,
        destination: parsed.destination || '',
        dates: parsed.days ? `${ parsed.days } days` : ''
      } )
    }
  }, [ location.state ] )

  const handleChange = ( e ) =>
  {
    const { name, value } = e.target

    if ( name === 'dates' )
    {
      // Check if value starts with 0 or is 0
      const numValue = parseInt( value )
      if ( !isNaN( numValue ) && numValue < 1 )
      {
        setDaysError( 'no of days shuld be min 1 day' )
      } else
      {
        setDaysError( '' )
      }
    }

    setFormData( {
      ...formData,
      [ name ]: value
    } )
  }

  const handleGenerateItinerary = async () =>
  {
    if ( !formData.destination.trim() )
    {
      toast.error( 'Please enter a destination' )
      return
    }

    setGenerating( true )
    try
    {
      const query = `Plan a trip to ${ formData.destination }${ formData.dates ? ` for ${ formData.dates }` : '' }${ formData.budget ? ` with budget ${ formData.budget }` : '' }${ formData.interests ? ` interested in ${ formData.interests }` : '' }`

      const response = await realtimeAPI.generateItinerary( query, {
        budget: 'medium',
        interests: formData.interests.split( ',' ).map( i => i.trim().toLowerCase() )
      } )

      const generatedItinerary = response.data.itinerary
      setItinerary( generatedItinerary )

      if ( generatedItinerary && user )
      {
        localStorageService.saveItinerary( generatedItinerary )
      }

      toast.success( 'Your itinerary is ready! Scroll down to see it.' )

      // Don't navigate away - show it here instead
      // if (generatedItinerary?._id) {
      //   navigate(`/itinerary/${generatedItinerary._id}`)
      // }
    } catch ( error )
    {
      handleAPIError( error, 'Failed to generate itinerary' )
    } finally
    {
      setGenerating( false )
    }
  }

  const tripTypes = [ 'City hops', 'Road trips', 'Solo resets', 'Family holidays' ]

  return (
    <>
      { generating && <TravelLoadingAnimation message="Creating your perfect itinerary..." /> }

      <div className="min-h-screen bg-gray-50">
        {/* Header */ }
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <nav className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="flex h-24 items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <Link to="/" className="text-2xl font-bold text-gray-900">
                  voyagemind
                </Link>
              </div>

              {/* Desktop Navigation */ }
              <div className="hidden md:flex items-center space-x-12">
                <Link to="/" className="text-base text-gray-600 hover:text-gray-900">Home</Link>
                <Link to="/planner" className="text-base text-gray-900 font-semibold">Planner</Link>
                <Link to="/booking" className="text-base text-gray-600 hover:text-gray-900">Booking</Link>
                <Link to="/dashboard" className="text-base text-gray-600 hover:text-gray-900">My Trips</Link>
                <Link to="/recommendations" className="text-base text-gray-600 hover:text-gray-900">Recommendations</Link>
                <Link to="/memories" className="text-base text-gray-600 hover:text-gray-900">Memories</Link>
              </div>

              {/* Desktop User Menu */ }
              <div className="hidden md:flex items-center space-x-4">
                { user ? (
                  <Link to="/profile" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700">Sign in / Profile</span>
                  </Link>
                ) : (
                  <Link to="/login" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700">Sign in / Profile</span>
                  </Link>
                ) }
              </div>

              {/* Mobile Menu Button */ }
              <div className="flex md:hidden">
                <button
                  type="button"
                  className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                  onClick={ () => setMobileMenuOpen( true ) }
                >
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Overlay */ }
          { mobileMenuOpen && (
            <div className="lg:hidden" role="dialog" aria-modal="true">
              <div className="fixed inset-0 z-50"></div>
              <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                <div className="flex items-center justify-between">
                  <Link to="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-2xl font-bold text-gray-900">voyagemind</span>
                  </Link>
                  <button
                    type="button"
                    className="-m-2.5 rounded-md p-2.5 text-gray-700"
                    onClick={ () => setMobileMenuOpen( false ) }
                  >
                    <span className="sr-only">Close menu</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-gray-500/10">
                    <div className="space-y-2 py-6">
                      <Link to="/" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Home</Link>
                      <Link to="/planner" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Planner</Link>
                      <Link to="/booking" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Booking</Link>
                      <Link to="/dashboard" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">My Trips</Link>
                      <Link to="/recommendations" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Recommendations</Link>
                      <Link to="/memories" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Memories</Link>
                    </div>
                    <div className="py-6">
                      { user ? (
                        <Link to="/profile" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                          Profile ({ user.name })
                        </Link>
                      ) : (
                        <Link to="/login" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                          Log in
                        </Link>
                      ) }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) }
        </header>

        {/* Hero Section */ }
        <section className="bg-gradient-to-br from-orange-50 to-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Content */ }
              <div>
                <div className="inline-block px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium mb-6">
                  Step 1 - Describe your trip
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  Tell the AI how you love to travel, it designs the days for you.
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Start with your destinations, dates, and vibe. The planner will stitch together a day-by-day itinerary that balances must-sees with slow, memorable moments.
                </p>
                <div className="flex items-center space-x-4">
                  { tripTypes.map( ( type, index ) => (
                    <button
                      key={ index }
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all border border-gray-200"
                    >
                      { type }
                    </button>
                  ) ) }
                </div>
              </div>

              {/* Right Content - AI Ready */ }
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 max-w-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Planner</h3>
                  <div className="flex items-center space-x-2 text-xs text-teal-600">
                    <Sparkles className="w-4 h-4" />
                    <span>AI ready</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Tip: Write in your own words — "5 lazy days between Lisbon and Porto with views, wine bars, and easy walks."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Planner Section */ }
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-2">From idea to structured trip</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Planner</h2>
              <p className="text-gray-600">Describe your trip and let the AI handle timing, flow, and local flavor.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column - Trip Setup (2 cols) */ }
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                <div className="flex items-center space-x-2 mb-6">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <h3 className="text-xl font-bold text-gray-900">Trip setup</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">AI uses this to personalize each day</p>

                <div className="space-y-6">
                  {/* Destination */ }
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Where are you going?
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={ formData.destination }
                      onChange={ handleChange }
                      placeholder='e.g. Lisbon & Porto, or "somewhere warm in Europe"'
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Days */ }
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days
                    </label>
                    <input
                      type="text"
                      name="dates"
                      value={ formData.dates }
                      onChange={ handleChange }
                      placeholder='Add number of days e.g. "5 days"'
                      className={ `w-full px-4 py-3 border ${ daysError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500' } rounded-lg focus:ring-2 focus:border-transparent` }
                    />
                    { daysError && <p className="text-red-500 text-xs mt-1">{ daysError }</p> }
                  </div>

                  {/* Budget */ }
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget
                    </label>
                    <input
                      type="text"
                      name="budget"
                      value={ formData.budget }
                      onChange={ handleChange }
                      placeholder="Approximate total budget or per day range"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Travel Style */ }
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Travel style
                    </label>
                    <select
                      name="travelStyle"
                      value={ formData.travelStyle }
                      onChange={ handleChange }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option>Balanced</option>
                      <option>Relaxed</option>
                      <option>Packed</option>
                      <option>Luxury</option>
                    </select>
                  </div>

                  {/* Interests */ }
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Must-dos & interests
                    </label>
                    <textarea
                      name="interests"
                      value={ formData.interests }
                      onChange={ handleChange }
                      rows={ 3 }
                      placeholder="Food markets, sunset viewpoints, hidden bars, museums, kid-friendly beaches..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Generate Button */ }
                  <div className="flex items-center space-x-3 pt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      <span>Ready to generate your itinerary.</span>
                    </div>
                  </div>
                  <button
                    onClick={ handleGenerateItinerary }
                    disabled={ generating || !formData.destination }
                    className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    { generating ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Itinerary</span>
                      </>
                    ) }
                  </button>
                </div>
              </div>

              {/* Right Column - AI Itinerary Preview */ }
              <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[800px] overflow-hidden">
                {/* Header */ }
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-bold text-gray-900">AI itinerary preview</h3>
                  </div>

                  {/* View Toggle */ }
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={ () => setActiveTab( 'itinerary' ) }
                      className={ `px-3 py-1.5 text-sm font-medium rounded-md transition-all ${ activeTab === 'itinerary' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700' }` }
                    >
                      List
                    </button>
                    <button
                      onClick={ () => setActiveTab( 'map' ) }
                      className={ `px-3 py-1.5 text-sm font-medium rounded-md transition-all ${ activeTab === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700' }` }
                    >
                      Map
                    </button>
                  </div>
                </div>

                {/* Preview Content */ }
                <div className="flex-1 overflow-y-auto bg-white relative">
                  {/* MAP VIEW */ }
                  { activeTab === 'map' && (
                    <div className="absolute inset-0 z-0">
                      <MapComponent places={ itinerary?.plan?.flatMap( day => day.places ) || [] } />
                    </div>
                  ) }

                  {/* LIST VIEW */ }
                  { activeTab === 'itinerary' && (
                    <div className="p-6 space-y-8">
                      { itinerary && itinerary.plan && itinerary.plan.length > 0 ? (
                        // Show REAL AI-generated itinerary
                        <>
                          { itinerary.plan.map( ( day, dayIndex ) => (
                            <div key={ dayIndex } className="relative">
                              {/* Day Header - Clean, no buttons */ }
                              <div className="flex items-center space-x-3 mb-6">
                                <h4 className="text-xl font-bold text-gray-900">Day { day.day }</h4>
                                { day.theme && (
                                  <span className="text-gray-500 text-base font-medium">{ day.emoji } { day.theme }</span>
                                ) }
                              </div>

                              {/* Activities List */ }
                              <div className="space-y-6">
                                { day.places && day.places.map( ( place, placeIndex ) =>
                                {
                                  // Determine Tag Style
                                  const isFood = [ 'breakfast', 'lunch', 'dinner' ].includes( place.activity_type ) ||
                                    ( place.category && place.category.some( c => c.includes( 'restaurant' ) || c.includes( 'food' ) ) );

                                  const tagLabel = isFood ? 'Food' : 'Explore';
                                  const tagColor = isFood ? 'bg-orange-100 text-orange-600' : 'bg-teal-50 text-teal-600';

                                  // Select Emoji based on type
                                  let icon = '📍';
                                  if ( place.activity_type === 'dinner' || ( place.category && place.category.some( c => c.includes( 'bar' ) || c.includes( 'wine' ) ) ) ) icon = '🍷';
                                  else if ( place.activity_type === 'lunch' || place.activity_type === 'breakfast' ) icon = '🍽️';
                                  else if ( place.category && place.category.some( c => c.includes( 'nature' ) || c.includes( 'park' ) ) ) icon = '🌳';
                                  else if ( place.category && place.category.some( c => c.includes( 'museum' ) || c.includes( 'art' ) ) ) icon = '🎨';
                                  else if ( place.category && place.category.some( c => c.includes( 'shopping' ) ) ) icon = '🛍️';
                                  else if ( place.activity_type === 'travel' || place.activity_type === 'transfer' ) icon = '🚗';

                                  return (
                                    <div key={ placeIndex } className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                                      <h5 className="font-bold text-gray-900 text-lg mb-2">{ place.display_name || place.name }</h5>

                                      <div className="flex items-start mb-4">
                                        <span className="mr-2 mt-0.5 text-base">{ icon }</span>
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                          { place.description || `Experience ${ place.display_name || place.name }` }
                                        </p>
                                      </div>

                                      <div className="flex items-center space-x-3 text-sm">
                                        <div className="text-gray-500 font-medium">
                                          { place.start_time } · { place.activity_type?.includes( 'transfer' ) || place.activity_type?.includes( 'travel' )
                                            ? 'travel'
                                            : place.activity_type?.replace( /_/g, ' ' ) || 'activity' }
                                        </div>

                                        <span className={ `px-3 py-1 rounded-md text-xs font-bold ${ tagColor }` }>
                                          { tagLabel }
                                        </span>

                                        { place.entry_fee !== undefined && (
                                          <span className="text-gray-500 font-semibold pl-1">
                                            ${ place.entry_fee === 0 ? 'Free' : place.entry_fee }
                                          </span>
                                        ) }
                                      </div>
                                    </div>
                                  );
                                } ) }
                              </div>

                              {/* Day Cost Footer */ }
                              { day.total_cost !== undefined && (
                                <div className="mt-5 text-sm font-medium text-gray-900">
                                  Day cost: <span className="font-bold">${ day.total_cost }</span>
                                </div>
                              ) }
                            </div>
                          ) ) }

                          {/* Action Buttons at bottom of list */ }
                          {/* Action Buttons at bottom of list */ }
                          <div className="flex flex-col space-y-3 pt-6 border-t border-gray-100">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={ async () =>
                                {
                                  if ( !user )
                                  {
                                    toast.error( 'Please sign in to save itineraries' );
                                    navigate( '/login' );
                                    return;
                                  }

                                  const toastId = toast.loading( 'Saving to My Trips...' );
                                  try
                                  {
                                    // 1. Save to backend
                                    const response = await itineraryAPI.save( itinerary );
                                    const savedItinerary = response.data;

                                    // Update local state with saved version (has real _id)
                                    setItinerary( savedItinerary );
                                    localStorageService.saveItinerary( savedItinerary );

                                    toast.success( 'Saved to My Trips!', { id: toastId } );

                                    // 2. Trigger PDF download
                                    toast.loading( 'Generating PDF...', { id: toastId } );
                                    const pdfBlob = await exportAPI.pdf( { itinerary_id: savedItinerary._id } );

                                    // Create download link
                                    const url = window.URL.createObjectURL( new Blob( [ pdfBlob.data ] ) );
                                    const link = document.createElement( 'a' );
                                    link.href = url;
                                    link.setAttribute( 'download', `Itinerary-${ savedItinerary.destination }.pdf` );
                                    document.body.appendChild( link );
                                    link.click();
                                    link.parentNode.removeChild( link );

                                    toast.dismiss( toastId );
                                    toast.success( 'PDF Downloaded!' );

                                  } catch ( error )
                                  {
                                    console.error( 'Save failed:', error );
                                    toast.error( 'Failed to save or download: ' + ( error.response?.data?.error || error.message ), { id: toastId } );
                                  }
                                } }
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={ () => navigate( `/itinerary/${ itinerary._id }` ) }
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                              >
                                Full View
                              </button>
                            </div>
                            <button
                              onClick={ () => toast.info( 'Booking feature coming soon' ) }
                              className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center space-x-2 shadow-sm"
                            >
                              <Calendar className="w-5 h-5" />
                              <span>Continue to booking</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        // Show placeholder when no itinerary yet
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-gray-300" />
                          </div>
                          <p className="text-lg font-medium text-gray-900 mb-2">Ready to plan?</p>
                          <p className="text-sm max-w-xs mx-auto">Tell us where and when, and watch your perfect trip appear here.</p>
                        </div>
                      ) }
                    </div>
                  ) }
                </div>

                {/* Footer Hints - Fixed at bottom of Preview Card */ }
                <div className="px-6 py-6 bg-white border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 text-base">Make the most of your plan</h4>
                    <span className="text-sm text-gray-400">Hints</span>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-500">
                    <li className="flex items-start space-x-3">
                      <span className="text-teal-500 font-bold mt-0.5">✓</span>
                      <span>Rewrite any activity title or note — the AI keeps timing and logistics aligned.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-teal-500 font-bold mt-0.5">✓</span>
                      <span>Use Regenerate day to try a slower, more packed, or more budget-friendly version.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-teal-500 font-bold mt-0.5">✓</span>
                      <span>When you are happy, jump to Booking to attach flights, stays, and experiences.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */ }
        <footer className="bg-white border-t border-gray-200 py-16 mt-20">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xl font-bold text-gray-900">voyagemind</span>
              </div>
              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <Link to="/about" className="hover:text-gray-900">About</Link>
                <Link to="/contact" className="hover:text-gray-900">Help center</Link>
                <Link to="/terms" className="hover:text-gray-900">Terms</Link>
                <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
              </div>
              <div className="flex items-center space-x-6">
                <button className="text-gray-600 hover:text-gray-900">
                  <span className="sr-only">Language</span>
                  🌐 English
                </button>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Plan · Book · Remember</span>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center text-sm text-gray-500">
              © 2025 voyageMind. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default PlannerWorkspace

