import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { itineraryAPI, memoriesAPI, handleAPIError, api } from '../services/api'
import { MapPin, Calendar, Camera, Plus, Eye, Trash2 } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import localStorageService from '../services/localStorageService'
import PageTransition from '../components/PageTransition'
import AnimatedSection from '../components/AnimatedSection'

const Dashboard = () =>
{
  const { user } = useAuth()
  const [ itineraries, setItineraries ] = useState( [] )
  const [ totalItineraries, setTotalItineraries ] = useState( 0 )
  const [ memories, setMemories ] = useState( [] )
  const [ loading, setLoading ] = useState( true )

  useEffect( () =>
  {
    loadDashboardData()
  }, [] )

  const loadDashboardData = async () =>
  {
    try
    {
      // Try to load from API first
      const [ itinerariesRes, memoriesRes ] = await Promise.all( [
        itineraryAPI.list( { limit: 5 } ).catch( () => ( { data: { itineraries: [] } } ) ),
        memoriesAPI.list( { limit: 6 } ).catch( () => ( { data: { memories: [] } } ) )
      ] )

      let apiItineraries = itinerariesRes.data.itineraries || [];

      // If API returned no itineraries, try localStorage
      if ( apiItineraries.length === 0 && user )
      {
        const localItineraries = localStorageService.getUserItineraries( user._id );
        console.log( `📱 Loaded ${ localItineraries.length } itineraries from localStorage` );
        apiItineraries = localItineraries;
      }

      setItineraries( apiItineraries )
      setTotalItineraries( itinerariesRes.data.total || apiItineraries.length )
      setMemories( memoriesRes.data.memories || [] )
    } catch ( error )
    {
      // Fallback to localStorage on error
      if ( user )
      {
        const localItineraries = localStorageService.getUserItineraries( user._id );
        console.log( `📱 Fallback: Loaded ${ localItineraries.length } itineraries from localStorage` );
        setItineraries( localItineraries );
      }
      handleAPIError( error, 'Failed to load dashboard data' )
    } finally
    {
      setLoading( false )
    }
  }

  const handleDeleteItinerary = async ( id ) =>
  {
    if ( !confirm( 'Are you sure you want to delete this itinerary?' ) ) return

    try
    {
      await itineraryAPI.delete( id )
      setItineraries( itineraries.filter( item => item._id !== id ) )
    } catch ( error )
    {
      handleAPIError( error, 'Failed to delete itinerary' )
    }
  }

  const handleDeleteMemory = async ( id ) =>
  {
    if ( !confirm( 'Are you sure you want to delete this memory?' ) ) return

    try
    {
      await memoriesAPI.delete( id )
      setMemories( memories.filter( item => item._id !== id ) )
    } catch ( error )
    {
      handleAPIError( error, 'Failed to delete memory' )
    }
  }

  const handleCleanupFakeItineraries = async () =>
  {
    if ( !confirm( 'This will delete old itineraries with fake places. Only real-time generated itineraries will be kept. Continue?' ) ) return

    try
    {
      const response = await api.delete( '/cleanup/fake-itineraries' )
      setItineraries( [] ) // Clear the list
      alert( `✅ Cleaned up ${ response.data.deleted_count } fake itineraries! Now create new ones with real places.` )
      loadDashboardData() // Reload to show remaining real itineraries
    } catch ( error )
    {
      handleAPIError( error, 'Failed to cleanup fake itineraries' )
    }
  }

  if ( loading )
  {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Welcome Section */ }
        {/* Welcome Section */ }
        <AnimatedSection className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 md:p-8 text-white shadow-sm">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, { user?.name }!
          </h1>
          <p className="text-blue-100 mb-6">
            Ready to plan your next adventure? Let's create something amazing together.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/planner"
              className="inline-flex items-center px-5 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Plan New Trip (Real Places)
            </Link>
            { itineraries.length > 0 && (
              <button
                onClick={ handleCleanupFakeItineraries }
                className="inline-flex items-center px-5 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-sm"
              >
                🧹 Clean Old Itineraries
              </button>
            ) }
          </div>
        </AnimatedSection>

        {/* Quick Stats */ }
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedSection delay={ 0.1 } className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Itineraries</p>
                <p className="text-3xl font-bold text-gray-900">{ totalItineraries }</p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={ 0.2 } className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Days Planned</p>
                <p className="text-3xl font-bold text-gray-900">
                  { itineraries.reduce( ( sum, item ) => sum + ( item.days || 0 ), 0 ) }
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={ 0.3 } className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Memories Created</p>
                <p className="text-3xl font-bold text-gray-900">{ memories.length }</p>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Recent Itineraries */ }
        <AnimatedSection delay={ 0.4 } className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Itineraries</h2>
              <Link
                to="/planner"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-4 md:p-6">
            { itineraries.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-6 text-lg">No itineraries yet</p>
                <Link
                  to="/planner"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Itinerary
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                { itineraries.map( ( itinerary ) => (
                  <div key={ itinerary._id } className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all gap-4 sm:gap-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        { itinerary.title || itinerary.destination }
                      </h3>
                      <p className="text-sm text-gray-600">
                        { itinerary.days } days • ${ itinerary.budget } budget
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created { new Date( itinerary.generated_on ).toLocaleDateString() }
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={ `/itinerary/${ itinerary._id }` }
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View itinerary"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={ () => handleDeleteItinerary( itinerary._id ) }
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete itinerary"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) ) }
              </div>
            ) }
          </div>
        </AnimatedSection>

        {/* Recent Memories */ }
        <AnimatedSection delay={ 0.5 } className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Memories</h2>
              <Link
                to="/memories"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            { memories.length === 0 ? (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No memories yet</p>
                <Link to="/memories" className="btn-primary">
                  Create Your First Memory
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                { memories.map( ( memory ) => (
                  <div key={ memory._id } className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={ memory.image_url }
                        alt={ memory.title }
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 rounded-lg flex items-end">
                      <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <h3 className="font-medium text-sm">{ memory.title }</h3>
                        <p className="text-xs text-gray-200">
                          { new Date( memory.created_on ).toLocaleDateString() }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={ () => handleDeleteMemory( memory._id ) }
                      className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) ) }
              </div>
            ) }
          </div>
        </AnimatedSection>
      </div>
    </PageTransition >
  )
}

export default Dashboard