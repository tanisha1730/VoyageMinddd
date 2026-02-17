import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, MapPin, TrendingUp, Heart, DollarSign, Calendar, Loader } from 'lucide-react';
import { handleAPIError } from '../services/api';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const Recommendations = () =>
{
  const { user } = useAuth();
  const navigate = useNavigate();
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [ loading, setLoading ] = useState( true );
  const [ recommendations, setRecommendations ] = useState( [] );
  const [ userProfile, setUserProfile ] = useState( null );

  useEffect( () =>
  {
    fetchRecommendations();
  }, [] );

  const fetchRecommendations = async () =>
  {
    try
    {
      setLoading( true );
      const token = localStorage.getItem( 'access_token' );

      const response = await axios.get( `${ API_BASE_URL }/recommendations/destinations?limit=12`, {
        headers: { Authorization: `Bearer ${ token }` }
      } );

      setRecommendations( response.data.recommendations );
      setUserProfile( response.data.userProfile );
    } catch ( error )
    {
      handleAPIError( error, 'Failed to load recommendations' );
    } finally
    {
      setLoading( false );
    }
  };

  const handlePlanTrip = ( destination, recommendation ) =>
  {
    // Create a natural language query based on user's profile and recommendation
    const days = userProfile?.preferredDuration || 4;
    const budgetLevel = userProfile?.budgetLevel || 'medium';
    const budgetAmount = budgetLevel === 'low' ? 1000 :
      budgetLevel === 'high' ? 5000 : 2000;
    const interests = userProfile?.topInterests?.slice( 0, 3 ).join( ', ' ) || 'sightseeing';

    const naturalQuery = `Plan a ${ days }-day trip to ${ destination }, budget $${ budgetAmount }, interested in ${ interests }`;

    navigate( '/planner', {
      state: {
        parsedData: {
          destination: destination,
          days: days,
          budget: budgetAmount,
          interests: userProfile?.topInterests || []
        },
        autoFillQuery: naturalQuery // This will auto-fill the textarea
      }
    } );
  };

  const getTypeIcon = ( type ) =>
  {
    switch ( type )
    {
      case 'similar': return <Heart className="w-5 h-5" />;
      case 'interest-based': return <Sparkles className="w-5 h-5" />;
      case 'trending': return <TrendingUp className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getTypeColor = ( type ) =>
  {
    switch ( type )
    {
      case 'similar': return 'bg-[#17A2B8]';
      case 'interest-based': return 'bg-[#17A2B8]';
      case 'trending': return 'bg-[#17A2B8]';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = ( type ) =>
  {
    switch ( type )
    {
      case 'similar': return 'Similar to your trips';
      case 'interest-based': return 'Matches your interests';
      case 'trending': return 'Trending now';
      default: return 'Recommended';
    }
  };

  if ( loading )
  {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#17A2B8] animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Analyzing your travel preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */ }
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-[#17A2B8]" />
            <h1 className="text-4xl font-bold text-gray-900">AI Recommendations</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Based on your travel history and preferences
          </p>
        </div>

        {/* User Profile Summary */ }
        { userProfile && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Travel Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#FFF8F0] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-[#17A2B8]" />
                  <span className="text-gray-600 text-sm">Total Trips</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{ userProfile.totalTrips }</p>
              </div>
              <div className="bg-[#FFF8F0] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-[#17A2B8]" />
                  <span className="text-gray-600 text-sm">Top Interests</span>
                </div>
                <p className="text-gray-900 font-medium">
                  { userProfile.topInterests?.slice( 0, 2 ).join( ', ' ) || 'Exploring' }
                </p>
              </div>
              <div className="bg-[#FFF8F0] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-[#17A2B8]" />
                  <span className="text-gray-600 text-sm">Budget Level</span>
                </div>
                <p className="text-gray-900 font-medium capitalize">{ userProfile.budgetLevel }</p>
              </div>
              <div className="bg-[#FFF8F0] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#17A2B8]" />
                  <span className="text-gray-600 text-sm">Preferred Duration</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{ userProfile.preferredDuration } days</p>
              </div>
            </div>
          </div>
        ) }

        {/* Recommendations Grid */ }
        { recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <Sparkles className="w-16 h-16 text-[#17A2B8] mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Start Your Journey!</h3>
            <p className="text-gray-600 mb-6">
              Create your first itinerary to get personalized recommendations
            </p>
            <button
              onClick={ () => navigate( '/planner' ) }
              className="bg-[#17A2B8] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#138496] transition-all"
            >
              Plan Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            { recommendations.map( ( rec, index ) => (
              <div
                key={ index }
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:border-[#17A2B8] hover:shadow-lg transition-all cursor-pointer"
                onClick={ () => handlePlanTrip( rec.destination ) }
              >
                {/* Destination Image Placeholder */ }
                {/* Destination Map Preview */ }
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    style={ { border: 0 } }
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    title={ `Map of ${ rec.destination }` }
                    src={
                      googleMapsApiKey
                        ? `https://www.google.com/maps/embed/v1/place?key=${ googleMapsApiKey }&q=${ encodeURIComponent( rec.destination ) }`
                        : `https://maps.google.com/maps?q=${ encodeURIComponent( rec.destination ) }&t=m&z=12&output=embed&iwloc=near`
                    }
                  ></iframe>
                </div>

                <div className="p-6">
                  {/* Type Badge */ }
                  <div className="flex items-center gap-2 mb-3">
                    <div className={ `${ getTypeColor( rec.type ) } p-2 rounded-lg text-white` }>
                      { getTypeIcon( rec.type ) }
                    </div>
                    <span className="text-xs text-gray-600">{ getTypeLabel( rec.type ) }</span>
                  </div>

                  {/* Destination Name */ }
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{ rec.destination }</h3>

                  {/* Reason */ }
                  <p className="text-gray-600 text-sm mb-4">{ rec.reason }</p>

                  {/* Score Bar */ }
                  {/* Score Bar - Only show for users with history */ }
                  { userProfile?.totalTrips > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Match Score</span>
                        <span className="font-semibold text-[#17A2B8]">{ Math.round( rec.score * 100 ) }%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#17A2B8] h-2 rounded-full transition-all"
                          style={ { width: `${ rec.score * 100 }%` } }
                        />
                      </div>
                    </div>
                  ) }

                  {/* Action Button */ }
                  <button
                    onClick={ ( e ) =>
                    {
                      e.stopPropagation();
                      handlePlanTrip( rec.destination );
                    } }
                    className="w-full bg-[#17A2B8] text-white py-2 rounded-lg font-semibold hover:bg-[#138496] transition-all"
                  >
                    Use this plan
                  </button>
                </div>
              </div>
            ) ) }
          </div>
        ) }

        {/* CTA Section */ }
        <div className="mt-12 bg-[#FFF8F0] rounded-2xl p-8 text-center border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Want More Recommendations?</h3>
          <p className="text-gray-600 mb-6">
            The more trips you plan, the better our recommendations become!
          </p>
          <button
            onClick={ () => navigate( '/planner' ) }
            className="bg-[#17A2B8] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#138496] transition-all"
          >
            Create New Itinerary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
