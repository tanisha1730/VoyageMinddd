import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, Play, User, MapPin, Calendar, Camera, Menu, X, Compass } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import MapComponent from '../components/MapComponent'
import PageTransition from '../components/PageTransition'
import AnimatedSection from '../components/AnimatedSection'

const Home = () =>
{
  const [ loading, setLoading ] = useState( false )
  const [ mobileMenuOpen, setMobileMenuOpen ] = useState( false )
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleStartPlanning = () =>
  {
    if ( !user )
    {
      navigate( '/login' )
    } else
    {
      navigate( '/planner' )
    }
  }

  // Demo places for the interactive map on landing page
  const demoPlaces = [
    {
      name: 'Eiffel Tower',
      location: { lat: 48.8584, lng: 2.2945 },
      activity_type: 'sightseeing',
      description: 'Iconic iron lady of Paris'
    },
    {
      name: 'Louvre Museum',
      location: { lat: 48.8606, lng: 2.3376 },
      activity_type: 'museum',
      description: 'Home of the Mona Lisa'
    },
    {
      name: 'Notre-Dame',
      location: { lat: 48.8529, lng: 2.3500 },
      activity_type: 'sightseeing',
      description: 'Gothic masterpiece'
    },
    {
      name: 'Le Marais',
      location: { lat: 48.8566, lng: 2.3522 },
      activity_type: 'walking_tour',
      description: 'Historic district with boutiques'
    }
  ]

  const features = [
    {
      icon: MapPin,
      title: 'Smart Itineraries',
      description: 'Share your dates, budget, and travel style. Get a complete day-by-day plan tailored to how you like to explore.',
      badge: 'Adaptive to weather & pace'
    },
    {
      icon: Calendar,
      title: 'One-click Booking',
      description: 'Connect your favorite providers and book flights, stays, and experiences directly from your itinerary.',
      info: 'Syncs with major providers',
      action: 'Explore booking',
      path: '/booking'
    },
    {
      icon: Camera,
      title: 'Save Your Memories',
      description: 'Turn your photos and notes into beautiful photocards or magazine-style spreads in a couple of clicks.',
      info: 'Polaroid, collage, and more',
      action: 'Browse memories',
      path: '/memories'
    }
  ]

  const destinations = [
    {
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop',
      title: 'Santorini escape',
      days: '4 days',
      type: 'Couples',
      vibe: 'Coastal views'
    },
    {
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      title: 'Tokyo neighborhoods',
      days: '6 days',
      type: 'Foodie',
      vibe: 'City lights'
    },
    {
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      title: 'Alpine trails',
      days: '5 days',
      type: 'Adventure',
      vibe: 'Scenic hikes'
    },
    {
      image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400&h=300&fit=crop',
      title: 'Colors of Marrakech',
      days: '3 days',
      type: 'Culture',
      vibe: 'Old towns'
    }
  ]

  const tripTypes = [ 'City breaks', 'Remote escapes', 'Family adventures', 'Solo journeys' ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Broader */ }
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <nav className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="flex h-24 items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <Compass className="w-8 h-8 text-gray-900" />
                <span className="text-2xl font-bold text-gray-900 tracking-tight">VoyageMind</span>
              </Link>

              {/* Desktop Navigation */ }
              <div className="hidden md:flex items-center space-x-12">
                <Link to="/" className="text-base text-gray-900 font-semibold">Home</Link>
                <Link to="/planner" className="text-base text-gray-600 hover:text-gray-900">Planner</Link>
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
                    <Compass className="w-8 h-8 text-gray-900" />
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">VoyageMind</span>
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
        <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */ }
              <AnimatedSection>
                <div className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-6">
                  AI-powered travel planning
                </div>
                <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Turn your travel ideas into smart itineraries in seconds.
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Describe your dream trip and let the AI craft day-by-day plans, find the best bookings, and save your memories in one beautiful place.
                </p>
                <div className="flex items-center space-x-4 mb-8">
                  <button
                    onClick={ handleStartPlanning }
                    disabled={ loading }
                    className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all"
                  >
                    { loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Start Planning</span>
                      </>
                    ) }
                  </button>
                </div>
                <div className="flex items-center space-x-8 text-sm text-gray-600">
                  <div>
                    <div className="font-bold text-gray-900">120k+</div>
                    <div>Trips planned</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">&lt; 2 minutes</div>
                    <div>Avg. planning time</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">4.8 / 5</div>
                    <div>Traveler rating</div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Right Content - Map Preview (Now Interactive) */ }
              <AnimatedSection delay={ 0.2 } className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="w-full h-64 rounded-lg mb-4 overflow-hidden relative z-0 border border-gray-100">
                    <MapComponent places={ demoPlaces } />
                  </div>
                  <div className="flex items-center justify-between">
                    { tripTypes.map( ( type, index ) => (
                      <button
                        key={ index }
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        { type }
                      </button>
                    ) ) }
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Sparkles className="w-4 h-4" />
                      <span>Lift off from ideas</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Camera className="w-4 h-4" />
                      <span>Land in memories</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Why VoyageMind Section */ }
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <AnimatedSection className="text-center mb-12">
              <p className="text-sm text-gray-500 mb-2">Why VoyageMind</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Plan, book, and relive every trip
              </h2>
              <p className="text-lg text-gray-600">
                Three ways VoyageMind makes travel easier.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              { features.map( ( feature, index ) => (
                <AnimatedSection key={ index } delay={ index * 0.1 } className="bg-gray-50 rounded-2xl p-8">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    { feature.title }
                  </h3>
                  <p className="text-gray-600 mb-4">
                    { feature.description }
                  </p>
                  { feature.badge && (
                    <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium mb-4">
                      { feature.badge }
                    </div>
                  ) }
                  { feature.info && (
                    <div className="text-sm text-gray-500 mb-4">
                      { feature.info }
                    </div>
                  ) }
                  { feature.path ? (
                    <Link to={ feature.path } className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                      { feature.action } →
                    </Link>
                  ) : feature.action ? (
                    <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                      { feature.action } →
                    </button>
                  ) : null }
                </AnimatedSection>
              ) ) }
            </div>
          </div>
        </section>

        {/* Featured Destinations */ }
        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <AnimatedSection className="flex items-center justify-between mb-12">
              <div>
                <p className="text-sm text-gray-500 mb-2">Inspiration to start from</p>
                <h2 className="text-4xl font-bold text-gray-900">Featured destinations</h2>
                <p className="text-lg text-gray-600 mt-2">
                  Tap into ready-made inspiration, then customize it with AI.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              { destinations.map( ( dest, index ) => (
                <AnimatedSection key={ index } delay={ index * 0.1 } className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-default">
                  <img
                    src={ dest.image }
                    alt={ dest.title }
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{ dest.title }</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{ dest.days }</span>
                      <span>•</span>
                      <span>{ dest.type }</span>
                      <span>•</span>
                      <span>{ dest.vibe }</span>
                    </div>
                  </div>
                </AnimatedSection>
              ) ) }
            </div>
          </div>
        </section>

        {/* Footer - Broader */ }
        <footer className="bg-white border-t border-gray-200 py-16">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              <div className="flex items-center space-x-3">
                <Compass className="w-6 h-6 text-gray-900" />
                <span className="text-xl font-bold text-gray-900">VoyageMind</span>
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
              © 2025 VoyageMind. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  )
}

export default Home
