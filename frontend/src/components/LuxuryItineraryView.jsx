import React, { useState, useEffect } from 'react';
import
{
  MapPin, Clock, Star, DollarSign, Cloud, Sun, CloudRain,
  Calendar, Users, Utensils, Activity
} from 'lucide-react';
import EnhancedItineraryView from './EnhancedItineraryView';
import { getCurrencyForDestination, getCurrencySymbol } from '../utils/currencyUtils';

const LuxuryItineraryView = ( { itinerary } ) =>
{
  const [ selectedDay, setSelectedDay ] = useState( 1 );

  const getWeatherIcon = ( condition ) =>
  {
    const icons = {
      'sunny': <Sun className="w-5 h-5 text-yellow-500" />,
      'clear': <Sun className="w-5 h-5 text-yellow-500" />,
      'partly_cloudy': <Cloud className="w-5 h-5 text-gray-500" />,
      'cloudy': <Cloud className="w-5 h-5 text-gray-600" />,
      'rain': <CloudRain className="w-5 h-5 text-blue-500" />,
      'thunderstorm': <CloudRain className="w-5 h-5 text-purple-500" />,
      'snow': <CloudRain className="w-5 h-5 text-blue-300" />,
      'drizzle': <CloudRain className="w-5 h-5 text-blue-400" />
    };
    return icons[ condition ] || <Cloud className="w-5 h-5 text-gray-500" />;
  };

  const getPlaceTypeIcon = ( place ) =>
  {
    const type = place.category?.[ 0 ] || 'attraction';
    const icons = {
      'restaurant': <Utensils className="w-5 h-5 text-orange-500" />,
      'local': <Users className="w-5 h-5 text-green-500" />,
      'activity': <Activity className="w-5 h-5 text-purple-500" />,
      'attraction': <MapPin className="w-5 h-5 text-blue-500" />
    };
    return icons[ type ] || <MapPin className="w-5 h-5 text-blue-500" />;
  };

  const currentDayPlan = itinerary.plan?.find( day => day.day === selectedDay );
  const currentWeather = itinerary.weather_forecast?.find( weather => weather.day === selectedDay );
  const totalPlaces = itinerary.plan?.reduce( ( sum, day ) => sum + ( day.places?.length || 0 ), 0 ) || 0;

  // Debug logging
  console.log( '🔍 Debug - Itinerary data:', itinerary );
  console.log( '🔍 Debug - Plan:', itinerary.plan );
  console.log( '🔍 Debug - Selected day:', selectedDay );
  console.log( '🔍 Debug - Current day plan:', currentDayPlan );
  console.log( '🔍 Debug - Total places:', totalPlaces );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Simple Header */ }
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            { itinerary.destination } Itinerary
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>{ itinerary.days } days</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>${ itinerary.budget } budget</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>{ totalPlaces } places</span>
            </div>
          </div>
        </div>

        {/* Simple Weather */ }
        { itinerary.weather_forecast && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              { itinerary.weather_forecast.slice( 0, 7 ).map( ( weather ) => (
                <div
                  key={ weather.day }
                  className={ `p-4 rounded-lg text-center cursor-pointer transition-colors ${ selectedDay === weather.day
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }` }
                  onClick={ () => setSelectedDay( weather.day ) }
                >
                  <p className="text-sm font-medium text-gray-700 mb-2">Day { weather.day }</p>
                  <div className="flex justify-center mb-2">
                    { getWeatherIcon( weather.condition ) }
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{ weather.temperature }°</p>
                </div>
              ) ) }
            </div>
          </div>
        ) }

        {/* Simple Day Selector */ }
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Days</h3>
              <div className="space-y-2">
                { itinerary.plan?.map( ( day ) => (
                  <button
                    key={ day.day }
                    onClick={ () => setSelectedDay( day.day ) }
                    className={ `w-full text-left p-3 rounded-lg transition-colors ${ selectedDay === day.day
                      ? 'bg-blue-50 border-2 border-blue-200 text-blue-900'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700'
                      }` }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Day { day.day }</p>
                        <p className="text-sm text-gray-500">{ day.places?.length || 0 } places</p>
                      </div>
                    </div>
                  </button>
                ) ) }
              </div>
            </div>
          </div>

          {/* Simple Day Content */ }
          <div className="lg:col-span-3">
            { currentDayPlan && (
              <div className="space-y-6">
                {/* Day Header */ }
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Day { selectedDay }
                    </h2>
                    { currentWeather && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        { getWeatherIcon( currentWeather.condition ) }
                        <span>{ currentWeather.temperature }°C</span>
                      </div>
                    ) }
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Timeline</span>
                      </div>
                      <p className="text-lg font-semibold text-blue-900">
                        { currentDayPlan.places?.length > 0 ?
                          `${ currentDayPlan.places[ 0 ].start_time } - ${ currentDayPlan.places[ currentDayPlan.places.length - 1 ].end_time }` :
                          'Full Day'
                        }
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Places</span>
                      </div>
                      <p className="text-lg font-semibold text-green-900">{ currentDayPlan.places?.length || 0 }</p>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-900">Cost</span>
                      </div>
                       <p className="text-lg font-semibold text-yellow-900">
                         { getCurrencySymbol( getCurrencyForDestination( itinerary?.destination ) ) }{ currentDayPlan.places?.reduce( ( sum, place ) => sum + ( place.entry_fee_local ?? place.entry_fee ?? 0 ), 0 ) || 0 }
                       </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced ChatGPT-Style Places List */ }
                <EnhancedItineraryView currentDayPlan={ currentDayPlan } itinerary={ itinerary } />
              </div>
            ) }
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuxuryItineraryView;
