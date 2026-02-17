import random
import numpy as np
from typing import List, Dict, Any
from ..models import OptimizationResponse, DayPlan, PlaceInPlan

class OptimizationService:
    def __init__(self):
        pass
    
    def optimize_itinerary(
        self,
        poi_list: List[Dict[str, Any]],
        start_location: Dict[str, float],
        daily_time_budget: int,
        days: int,
        opening_hours: Dict[str, Any],
        distance_matrix: List[List[Dict[str, Any]]],
        mode: str = "greedy"
    ) -> OptimizationResponse:
        """
        Optimize itinerary routing and scheduling.
        """
        if not poi_list:
            return OptimizationResponse(plan=[])
        
        if mode == "genetic":
            return self._genetic_optimization(
                poi_list, start_location, daily_time_budget, days, opening_hours, distance_matrix
            )
        else:
            return self._greedy_optimization(
                poi_list, start_location, daily_time_budget, days, opening_hours, distance_matrix
            )
    
    def _greedy_optimization(
        self,
        poi_list: List[Dict[str, Any]],
        start_location: Dict[str, float],
        daily_time_budget: int,
        days: int,
        opening_hours: Dict[str, Any],
        distance_matrix: List[List[Dict[str, Any]]]
    ) -> OptimizationResponse:
        """
        Greedy nearest-neighbor optimization approach.
        """
        plan = []
        available_pois = poi_list.copy()
        
        for day in range(1, days + 1):
            day_plan = []
            current_time = 9.0  # Start at 9 AM
            current_location = start_location
            daily_pois = []
            
            # Select POIs for this day using greedy approach
            while (current_time < 9 + daily_time_budget and 
                   available_pois and 
                   len(daily_pois) < 6):  # Max 6 places per day
                
                # Find nearest unvisited POI
                best_poi = None
                best_distance = float('inf')
                best_index = -1
                
                for i, poi in enumerate(available_pois):
                    distance = self._calculate_distance(
                        current_location, 
                        poi.get("location", {"lat": 0, "lng": 0})
                    )
                    
                    # Consider opening hours if available
                    if self._is_poi_open(poi, current_time, opening_hours):
                        if distance < best_distance:
                            best_distance = distance
                            best_poi = poi
                            best_index = i
                
                if best_poi is None:
                    break
                
                # Calculate visit duration (1-3 hours based on POI type)
                visit_duration = self._estimate_visit_duration(best_poi)
                
                # Check if we have enough time
                travel_time = best_distance / 50.0  # Assume 50 km/h average speed
                if current_time + travel_time + visit_duration > 9 + daily_time_budget:
                    break
                
                # Add to day plan
                start_time = current_time + travel_time
                end_time = start_time + visit_duration
                
                day_plan.append(PlaceInPlan(
                    place_id=best_poi.get("place_id", f"poi_{len(daily_pois)}"),
                    name=best_poi.get("name", f"Place {len(daily_pois) + 1}"),
                    start_time=self._format_time(start_time),
                    end_time=self._format_time(end_time)
                ))
                
                # Update state
                daily_pois.append(best_poi)
                available_pois.pop(best_index)
                current_time = end_time
                current_location = best_poi.get("location", current_location)
            
            if day_plan:
                plan.append(DayPlan(day=day, places=day_plan))
        
        return OptimizationResponse(plan=plan)
    
    def _genetic_optimization(
        self,
        poi_list: List[Dict[str, Any]],
        start_location: Dict[str, float],
        daily_time_budget: int,
        days: int,
        opening_hours: Dict[str, Any],
        distance_matrix: List[List[Dict[str, Any]]]
    ) -> OptimizationResponse:
        """
        Genetic algorithm optimization (simplified implementation).
        """
        # For now, use greedy as baseline and add some randomization
        greedy_result = self._greedy_optimization(
            poi_list, start_location, daily_time_budget, days, opening_hours, distance_matrix
        )
        
        # Add some genetic-like improvements
        plan = greedy_result.plan
        
        # Randomly swap some places between days for diversity
        if len(plan) > 1:
            for _ in range(min(3, len(poi_list) // 2)):
                day1_idx = random.randint(0, len(plan) - 1)
                day2_idx = random.randint(0, len(plan) - 1)
                
                if (day1_idx != day2_idx and 
                    plan[day1_idx].places and 
                    plan[day2_idx].places):
                    
                    place1_idx = random.randint(0, len(plan[day1_idx].places) - 1)
                    place2_idx = random.randint(0, len(plan[day2_idx].places) - 1)
                    
                    # Swap places
                    plan[day1_idx].places[place1_idx], plan[day2_idx].places[place2_idx] = \
                        plan[day2_idx].places[place2_idx], plan[day1_idx].places[place1_idx]
        
        return OptimizationResponse(plan=plan)
    
    def _calculate_distance(self, loc1: Dict[str, float], loc2: Dict[str, float]) -> float:
        """
        Calculate approximate distance between two locations using Haversine formula.
        """
        lat1, lng1 = loc1.get("lat", 0), loc1.get("lng", 0)
        lat2, lng2 = loc2.get("lat", 0), loc2.get("lng", 0)
        
        # Convert to radians
        lat1, lng1, lat2, lng2 = map(np.radians, [lat1, lng1, lat2, lng2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlng/2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        
        # Earth radius in kilometers
        r = 6371
        return r * c
    
    def _is_poi_open(self, poi: Dict[str, Any], current_time: float, opening_hours: Dict[str, Any]) -> bool:
        """
        Check if POI is open at the given time.
        """
        # Simplified check - assume most places are open 9-18
        poi_id = poi.get("place_id", "")
        if poi_id in opening_hours:
            # TODO: Implement proper opening hours check
            pass
        
        # Default assumption: open during typical hours
        return 9 <= current_time <= 18
    
    def _estimate_visit_duration(self, poi: Dict[str, Any]) -> float:
        """
        Estimate visit duration based on POI type and characteristics.
        """
        categories = poi.get("category", [])
        
        # Duration mapping based on category
        duration_map = {
            "museum": 2.5,
            "park": 2.0,
            "restaurant": 1.5,
            "shopping_mall": 2.0,
            "tourist_attraction": 1.5,
            "church": 1.0,
            "monument": 0.5
        }
        
        # Find matching category
        for category in categories:
            category_lower = category.lower()
            for key, duration in duration_map.items():
                if key in category_lower:
                    return duration
        
        # Default duration
        return 1.5
    
    def _format_time(self, time_float: float) -> str:
        """
        Convert float time to HH:MM format.
        """
        hours = int(time_float)
        minutes = int((time_float - hours) * 60)
        return f"{hours:02d}:{minutes:02d}"