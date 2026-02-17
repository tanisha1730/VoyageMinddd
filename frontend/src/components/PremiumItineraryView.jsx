import { useState } from 'react';
import { MapPin, Clock, DollarSign } from 'lucide-react';

const PremiumItineraryView = ({ itinerary }) => {
  const [selectedDay, setSelectedDay] = useState(1);

  // Get emoji for category
  const getCategoryEmoji = (category) => {
    const categoryMap = {
      'restaurant': '🍽️',
      'food': '🍽️',
      'cafe': '☕',
      'culture': '🎨',
      'museum': '🏛️',
      'art': '🎨',
      'landmark': '🏛️',
      'monument': '🗿',
      'park': '🌳',
      'nature': '🌳',
      'beach': '🏖️',
      'activity': '🎯',
      'adventure': '🎯',
      'shopping': '🛍️',
      'market': '🛍️',
      'nightlife': '🌃',
      'entertainment': '🎭',
      'religious': '⛪',
      'mosque': '🕌',
      'temple': '🛕',
      'church': '⛪',
      'attraction': '📍',
      'tourist_attraction': '📍',
      'local': '🏘️',
      'diving': '🤿',
      'snorkeling': '🤿'
    };
    
    if (Array.isArray(category)) {
      return categoryMap[category[0]?.toLowerCase()] || '📍';
    }
    return categoryMap[category?.toLowerCase()] || '📍';
  };

  const currentDayPlan = itinerary.plan?.find(day => day.day === selectedDay);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Day Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {itinerary.plan?.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedDay === day.day
                    ? 'bg-[#17A2B8] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* Day Header */}
        {currentDayPlan && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Day {selectedDay}
                </h2>
                <div className="text-sm text-gray-600">
                  Day cost: <span className="font-semibold text-gray-900">
                    ${currentDayPlan.places?.reduce((sum, place) => sum + (place.entry_fee || 0), 0) || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Places List */}
            <div className="space-y-4">
              {currentDayPlan.places?.map((place) => (
                <div 
                  key={place.place_id} 
                  className="bg-[#E8E8E8] rounded-lg p-5 hover:bg-[#DCDCDC] transition-colors"
                >
                  {/* Category Badge */}
                  {place.category && place.category[0] && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#17A2B8] text-white">
                        {getCategoryEmoji(place.category)} {place.category[0].replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  {/* Place Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {place.name}
                  </h3>

                  {/* Activity Type */}
                  {place.description && (
                    <div className="flex items-start mb-3">
                      <MapPin className="w-4 h-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">
                        {place.enhanced_description || place.description}
                      </p>
                    </div>
                  )}

                  {/* Time and Price */}
                  <div className="flex items-center space-x-4 text-sm">
                    {/* Time */}
                    {place.start_time && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{place.start_time}</span>
                      </div>
                    )}

                    {/* Price Badge */}
                    {place.entry_fee !== undefined && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-800">
                        {place.entry_fee === 0 ? 'Free' : `$${place.entry_fee}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PremiumItineraryView;
