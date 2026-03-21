import React from 'react';
import { Clock, DollarSign, MapPin } from 'lucide-react';
import { formatEntryFee } from '../utils/currencyUtils';

const EnhancedItineraryView = ( { currentDayPlan, itinerary } ) =>
{
  if ( !currentDayPlan ) return null;

  return (
    <div className="space-y-4">
      { currentDayPlan.places?.map( ( place, index ) => (
        <div
          key={ place.place_id }
          className={ `rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${ place.activity_type === 'travel'
              ? 'bg-blue-50 border-blue-300 border-l-4'
              : 'bg-white border-gray-200'
            }` }
        >
          <div className="flex items-start space-x-4">
            {/* Step Number or Travel Icon */ }
            { place.activity_type === 'travel' ? (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">
                🚗
              </div>
            ) : (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                { index + 1 }
              </div>
            ) }

            <div className="flex-1">
              {/* Place Name with Location */ }
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                { place.display_name || place.name }
                { place.area && !place.display_name && (
                  <span className="text-sm text-gray-500 font-normal ml-2">- { place.area }</span>
                ) }
              </h3>

              {/* Time, Rating, Price, Distance */ }
              <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                <div className="flex items-center space-x-1 text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>{ place.start_time } - { place.end_time }</span>
                </div>
                { place.distance_km && (
                  <div className="flex items-center space-x-1 text-blue-700">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{ place.distance_km }km · { place.travel_minutes } min</span>
                  </div>
                ) }
                { place.rating > 0 && (
                  <div className="flex items-center space-x-1 text-gray-700">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{ place.rating.toFixed( 1 ) }/5</span>
                  </div>
                ) }
                { place.entry_fee !== undefined && place.activity_type !== 'travel' && (
                  <div className="flex items-center space-x-1 text-green-700">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">
                      { formatEntryFee( place, itinerary?.destination ) || 'Free Entry' }
                    </span>
                  </div>
                ) }
              </div>

              {/* Categories */ }
              {/* Categories */ }
              { ( place.category?.length > 0 || place.tags?.length > 0 ) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  { place.category
                    ?.filter( cat => !cat.includes( ':' ) && ![ 'layer', 'level' ].includes( cat ) )
                    .map( ( cat ) => (
                      <span key={ cat } className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium uppercase">
                        { cat.replace( /_/g, ' ' ) }
                      </span>
                    ) ) }
                  { place.tags
                    ?.filter( tag => !tag.includes( ':' ) && ![ 'layer', 'level' ].includes( tag ) )
                    .slice( 0, 3 )
                    .map( ( tag ) => (
                      <span key={ tag } className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        { tag.replace( /_/g, ' ' ) }
                      </span>
                    ) ) }
                </div>
              ) }
            </div>

            {/* Map Button (hide for travel entries) */ }
            { place.activity_type !== 'travel' && (
              <button
                onClick={ () =>
                {
                  const query = encodeURIComponent( `${ place.name } ${ itinerary.destination }` );
                  window.open( `https://www.google.com/maps/search/?api=1&query=${ query }`, '_blank' );
                } }
                className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                📍 Map
              </button>
            ) }
          </div>
        </div>
      ) ) }
    </div>
  );
};

export default EnhancedItineraryView;
