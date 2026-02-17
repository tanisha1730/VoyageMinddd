from typing import List, Dict, Any
from ..models import WeatherAdjustResponse, WeatherAdjustment

class WeatherService:
    def __init__(self):
        # Define weather-based activity mappings
        self.outdoor_activities = [
            "park", "beach", "hiking", "outdoor", "garden", "zoo", "stadium",
            "monument", "walking_tour", "market", "street"
        ]
        
        self.indoor_alternatives = [
            "museum", "gallery", "shopping_mall", "restaurant", "cafe", "theater",
            "cinema", "library", "aquarium", "indoor_market", "spa"
        ]
    
    def adjust_itinerary(
        self, 
        itinerary: Dict[str, Any], 
        weather_forecast: List[Dict[str, Any]]
    ) -> WeatherAdjustResponse:
        """
        Adjust itinerary based on weather conditions.
        Swaps outdoor activities with indoor alternatives during bad weather.
        """
        adjusted_itinerary = itinerary.copy()
        adjustments = []
        
        # Create weather lookup by day
        weather_by_day = {w["day"]: w for w in weather_forecast}
        
        # Process each day in the plan
        if "plan" in adjusted_itinerary:
            for day_plan in adjusted_itinerary["plan"]:
                day_num = day_plan.get("day", 1)
                weather = weather_by_day.get(day_num, {})
                
                if self._is_bad_weather(weather):
                    # Find outdoor activities to swap
                    places_to_adjust = []
                    
                    for i, place in enumerate(day_plan.get("places", [])):
                        if self._is_outdoor_activity(place):
                            places_to_adjust.append((i, place))
                    
                    # Perform swaps
                    for place_index, outdoor_place in places_to_adjust:
                        indoor_alternative = self._find_indoor_alternative(
                            outdoor_place, 
                            adjusted_itinerary
                        )
                        
                        if indoor_alternative:
                            # Record the adjustment
                            adjustment = WeatherAdjustment(
                                day=day_num,
                                original_place_id=outdoor_place.get("place_id", ""),
                                replacement_place_id=indoor_alternative.get("place_id", ""),
                                reason=self._get_weather_reason(weather)
                            )
                            adjustments.append(adjustment)
                            
                            # Update the place in the itinerary
                            day_plan["places"][place_index] = indoor_alternative
        
        return WeatherAdjustResponse(
            adjusted_itinerary=adjusted_itinerary,
            adjustments=adjustments
        )
    
    def _is_bad_weather(self, weather: Dict[str, Any]) -> bool:
        """
        Determine if weather conditions are bad for outdoor activities.
        """
        condition = weather.get("condition", "").lower()
        precipitation = weather.get("precipitation", 0)
        temperature = weather.get("temperature", 20)
        
        # Bad weather conditions
        bad_conditions = ["rain", "storm", "snow", "thunderstorm", "heavy_rain"]
        
        return (
            any(bad in condition for bad in bad_conditions) or
            precipitation > 5.0 or  # More than 5mm precipitation
            temperature < 0 or temperature > 35  # Extreme temperatures
        )
    
    def _is_outdoor_activity(self, place: Dict[str, Any]) -> bool:
        """
        Check if a place/activity is primarily outdoor.
        """
        categories = place.get("category", [])
        tags = place.get("tags", [])
        name = place.get("name", "").lower()
        
        # Check categories and tags
        all_descriptors = categories + tags + [name]
        descriptors_text = " ".join(str(d).lower() for d in all_descriptors)
        
        return any(outdoor in descriptors_text for outdoor in self.outdoor_activities)
    
    def _find_indoor_alternative(
        self, 
        outdoor_place: Dict[str, Any], 
        itinerary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Find an indoor alternative for an outdoor activity.
        This is a simplified implementation - in practice, you'd query a database.
        """
        # Create a generic indoor alternative based on the outdoor activity
        original_name = outdoor_place.get("name", "Outdoor Activity")
        
        # Simple mapping based on activity type
        if any(word in original_name.lower() for word in ["park", "garden"]):
            alternative_name = "Indoor Garden/Conservatory"
            alternative_category = ["indoor_attraction", "garden"]
        elif any(word in original_name.lower() for word in ["market", "street"]):
            alternative_name = "Shopping Mall"
            alternative_category = ["shopping_mall", "indoor"]
        elif any(word in original_name.lower() for word in ["monument", "statue"]):
            alternative_name = "History Museum"
            alternative_category = ["museum", "history"]
        else:
            alternative_name = "Art Gallery"
            alternative_category = ["museum", "art", "gallery"]
        
        # Create alternative place object
        alternative = {
            "place_id": f"indoor_alt_{outdoor_place.get('place_id', 'unknown')}",
            "name": alternative_name,
            "category": alternative_category,
            "start_time": outdoor_place.get("start_time"),
            "end_time": outdoor_place.get("end_time"),
            "tags": ["indoor", "weather_alternative"],
            "location": outdoor_place.get("location", {}),
            "rating": outdoor_place.get("rating", 4.0),
            "entry_fee": outdoor_place.get("entry_fee", 0)
        }
        
        return alternative
    
    def _get_weather_reason(self, weather: Dict[str, Any]) -> str:
        """
        Generate a human-readable reason for the weather adjustment.
        """
        condition = weather.get("condition", "bad weather")
        precipitation = weather.get("precipitation", 0)
        temperature = weather.get("temperature")
        
        if precipitation > 5:
            return f"Heavy precipitation expected ({precipitation}mm)"
        elif temperature is not None and temperature < 5:
            return f"Very cold weather ({temperature}°C)"
        elif temperature is not None and temperature > 35:
            return f"Extremely hot weather ({temperature}°C)"
        else:
            return f"Unfavorable weather conditions ({condition})"