import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { itineraryAPI, exportAPI, handleAPIError } from '../services/api';
import { toast } from 'react-hot-toast';
import LuxuryItineraryView from '../components/LuxuryItineraryView';
import LoadingSpinner from '../components/LoadingSpinner';
import localStorageService from '../services/localStorageService';

// Main component to view a specific itinerary
const ItineraryView = () =>
{
  // Extract the 'id' parameter from the URL (e.g., /itinerary/:id)
  const { id } = useParams();

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Get current authenticated user context
  const { user } = useAuth();

  // State to hold the itinerary data
  const [ itinerary, setItinerary ] = useState( null );

  // State to track loading status (default to true largely to show spinner initially)
  const [ loading, setLoading ] = useState( true );

  // State to store any error messages
  const [ error, setError ] = useState( '' );

  // Effect to fetch itinerary data when the component mounts or ID changes
  useEffect( () =>
  {
    fetchItinerary();
  }, [ id ] );

  // Function to retrieve itinerary data
  const fetchItinerary = async () =>
  {
    try
    {
      // Set loading state to true before starting fetch
      setLoading( true );

      // Try fetching from the API first
      try
      {
        const response = await itineraryAPI.get( id );
        setItinerary( response.data ); // Update state on success
        setError( '' ); // Clear any previous errors
      } catch ( apiError )
      {
        // If API fails, log it and try finding it in local storage (offline fallback)
        console.log( '📱 API failed, trying localStorage...' );
        const localItinerary = localStorageService.getItinerary( id );

        if ( localItinerary )
        {
          // If found in local storage, use it
          console.log( '✅ Loaded itinerary from localStorage' );
          setItinerary( localItinerary );
          setError( '' );
        } else
        {
          // If not found in local storage either, re-throw the original API error
          throw apiError;
        }
      }
    } catch ( err )
    {
      // Handle any errors that occurred during the process
      setError( err.response?.data?.error || 'Failed to load itinerary' );
    } finally
    {
      // Always turn off loading spinner when done (success or fail)
      setLoading( false );
    }
  };

  // Handler for sharing the itinerary
  const handleShare = async () =>
  {
    // Check if the browser supports the Web Share API (mobile/modern browsers)
    if ( navigator.share )
    {
      try
      {
        await navigator.share( {
          title: `${ itinerary.destination } Itinerary`,
          text: `Check out my ${ itinerary.days }-day trip to ${ itinerary.destination }!`,
          url: window.location.href // Share the current URL
        } );
      } catch ( err )
      {
        // User cancelled the share sheet or other error
        console.log( 'Share cancelled' );
      }
    } else
    {
      // Fallback for browsers that don't support Web Share (e.g., desktop Chrome)
      // Copy the URL to clipboard
      navigator.clipboard.writeText( window.location.href );
      toast.success( 'Link copied to clipboard!' );
    }
  };

  // Handler for exporting the itinerary as PDF
  const handleExport = async () =>
  {
    try
    {
      // Show loading toast
      toast.loading( 'Generating PDF...', { id: 'pdf-toast' } );

      // Call API to generate PDF
      const response = await exportAPI.pdf( {
        itinerary_id: itinerary._id,
        include_map: true
      } );

      // Create a Blob from the binary PDF data
      const blob = new Blob( [ response.data ], { type: 'application/pdf' } );

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL( blob );

      // Create a hidden anchor element to trigger the download
      const a = document.createElement( 'a' );
      a.href = url;
      a.download = `itinerary-${ itinerary.destination }.pdf`; // Set filename
      document.body.appendChild( a );
      a.click(); // Programmatically click to download

      // Clean up: revoke URL to free memory and remove anchor
      window.URL.revokeObjectURL( url );
      document.body.removeChild( a );

      // Show success message
      toast.success( 'PDF downloaded!', { id: 'pdf-toast' } );
    } catch ( error )
    {
      console.error( 'PDF export failed:', error );
      toast.error( 'Failed to export PDF', { id: 'pdf-toast' } );
    }
  };

  // Loading state view
  if ( loading )
  {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6 mx-auto">
            <LoadingSpinner size="lg" />
          </div>
          <p className="text-amber-400 text-xl font-semibold">Crafting your luxury experience...</p>
          <p className="text-slate-400 mt-2">Curating the finest destinations</p>
        </div>
      </div>
    );
  }

  // Error state view
  if ( error )
  {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <p className="text-red-600 mb-4 text-lg">{ error }</p>
          <button
            onClick={ () => navigate( '/dashboard' ) }
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Not found state view (loaded but no data)
  if ( !itinerary )
  {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <p className="text-gray-600 text-lg">Itinerary not found</p>
          <button
            onClick={ () => navigate( '/dashboard' ) }
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main render view with itinerary data
  return (
    <div className="min-h-screen">
      {/* Sticky Header - Navigation & Actions */ }
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <button
          onClick={ () => navigate( '/dashboard' ) }
          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">Back to Dashboard</span>
          <span className="font-medium sm:hidden">Back</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Share Button */ }
          <button
            onClick={ handleShare }
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Share Itinerary"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* PDF Export Button */ }
          <button
            onClick={ handleExport }
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Export PDF"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Edit Button - Only visible to the owner */ }
          { user && itinerary.user_id === user._id && (
            <button
              onClick={ () => navigate( `/planner?edit=${ id }` ) }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-all flex items-center space-x-2"
              title="Edit Itinerary"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          ) }
        </div>
      </div>

      {/* Luxury Itinerary Visual Component */ }
      <LuxuryItineraryView itinerary={ itinerary } />
    </div>
  );
};

export default ItineraryView;