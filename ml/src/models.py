from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Request Models
class NLPParseRequest(BaseModel):
    text: str = Field(..., description="Natural language travel request")

class RecommendationRequest(BaseModel):
    user_id: str
    preferences: Dict[str, Any]
    destination: str
    poi_candidates: List[Dict[str, Any]]

class OptimizationRequest(BaseModel):
    poi_list: List[Dict[str, Any]]
    start_location: Dict[str, float]  # {"lat": float, "lng": float}
    daily_time_budget: int  # hours
    days: int
    opening_hours: Dict[str, Any] = {}
    distance_matrix: List[List[Dict[str, Any]]]
    mode: Optional[str] = "greedy"  # "greedy" or "genetic"

class WeatherAdjustRequest(BaseModel):
    itinerary: Dict[str, Any]
    weather_forecast: List[Dict[str, Any]]

class PostcardCaptionRequest(BaseModel):
    poi: Dict[str, Any]
    date: str  # YYYY-MM-DD format
    weather: str
    image_features: Optional[Dict[str, Any]] = None

# Response Models
class ConfidenceScores(BaseModel):
    destination: float = Field(..., ge=0.0, le=1.0)
    days: float = Field(..., ge=0.0, le=1.0)
    budget: float = Field(..., ge=0.0, le=1.0)

class NLPParseResponse(BaseModel):
    destination: str
    days: int
    budget: float
    interests: List[str]
    confidence: ConfidenceScores

class RecommendationResponse(BaseModel):
    place_id: str
    score: float = Field(..., ge=0.0, le=1.0)
    tags: List[str]

class PlaceInPlan(BaseModel):
    place_id: str
    name: str
    start_time: str
    end_time: str

class DayPlan(BaseModel):
    day: int
    places: List[PlaceInPlan]

class OptimizationResponse(BaseModel):
    plan: List[DayPlan]

class WeatherAdjustment(BaseModel):
    day: int
    original_place_id: str
    replacement_place_id: str
    reason: str

class WeatherAdjustResponse(BaseModel):
    adjusted_itinerary: Dict[str, Any]
    adjustments: List[WeatherAdjustment]

class PostcardCaptionResponse(BaseModel):
    caption: str