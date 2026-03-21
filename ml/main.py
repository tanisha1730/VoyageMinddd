# Real-time ML service — no database used.
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
# import spacy  # Commented out for simplified version
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn
import json

app = FastAPI(title="AI Travel Planner ML Service", version="1.0.0")

# Simplified NLP without spaCy for now
nlp = None

# Real-time place generation database - location-specific attractions
REAL_PLACES_DB = {
    "goa": [
        # Famous Attractions
        {"name": "Baga Beach", "tags": ["beach", "nightlife", "water_sports"], "popularity": 4.8, "lat": 15.5557, "lng": 73.7516, "type": "attraction", "duration": 3, "best_time": "morning"},
        {"name": "Fort Aguada", "tags": ["history", "fort", "portuguese"], "popularity": 4.4, "lat": 15.4909, "lng": 73.7732, "type": "attraction", "duration": 2, "best_time": "afternoon"},
        {"name": "Basilica of Bom Jesus", "tags": ["religious", "unesco", "architecture"], "popularity": 4.6, "lat": 15.5008, "lng": 73.9115, "type": "attraction", "duration": 1.5, "best_time": "morning"},
        
        # Local Experiences
        {"name": "Anjuna Flea Market", "tags": ["shopping", "local", "handicrafts"], "popularity": 4.3, "lat": 15.5736, "lng": 73.7400, "type": "local", "duration": 2, "best_time": "evening"},
        {"name": "Spice Plantation Tour", "tags": ["nature", "spices", "cultural", "local"], "popularity": 4.1, "lat": 15.3773, "lng": 74.1240, "type": "local", "duration": 4, "best_time": "morning"},
        {"name": "Fontainhas Latin Quarter", "tags": ["heritage", "local", "photography"], "popularity": 4.2, "lat": 15.4909, "lng": 73.8278, "type": "local", "duration": 2, "best_time": "afternoon"},
        
        # Restaurants & Food
        {"name": "Fisherman's Wharf", "tags": ["seafood", "restaurant", "riverside"], "popularity": 4.4, "lat": 15.5557, "lng": 73.7516, "type": "restaurant", "duration": 1.5, "best_time": "dinner"},
        {"name": "Thalassa", "tags": ["greek", "restaurant", "sunset"], "popularity": 4.5, "lat": 15.5736, "lng": 73.7400, "type": "restaurant", "duration": 2, "best_time": "dinner"},
        {"name": "Local Goan Thali at Mum's Kitchen", "tags": ["local_food", "authentic", "goan"], "popularity": 4.3, "lat": 15.4909, "lng": 73.8278, "type": "restaurant", "duration": 1, "best_time": "lunch"},
        
        # Activities
        {"name": "Dudhsagar Waterfall Trek", "tags": ["nature", "waterfall", "trekking", "adventure"], "popularity": 4.7, "lat": 15.3144, "lng": 74.3144, "type": "activity", "duration": 6, "best_time": "morning"},
        {"name": "Sunset Cruise on Mandovi River", "tags": ["cruise", "sunset", "romantic"], "popularity": 4.4, "lat": 15.4909, "lng": 73.8278, "type": "activity", "duration": 2, "best_time": "evening"}
    ],
    "mumbai": [
        # Famous Attractions
        {"name": "Gateway of India", "tags": ["monument", "colonial", "harbor"], "popularity": 4.5, "lat": 18.9220, "lng": 72.8347, "type": "attraction", "duration": 1, "best_time": "morning"},
        {"name": "Marine Drive", "tags": ["promenade", "sunset", "romantic"], "popularity": 4.4, "lat": 18.9439, "lng": 72.8234, "type": "attraction", "duration": 1.5, "best_time": "evening"},
        {"name": "Elephanta Caves", "tags": ["unesco", "caves", "ancient"], "popularity": 4.3, "lat": 18.9633, "lng": 72.9315, "type": "attraction", "duration": 4, "best_time": "morning"},
        {"name": "Chhatrapati Shivaji Terminus", "tags": ["railway", "unesco", "architecture"], "popularity": 4.2, "lat": 18.9401, "lng": 72.8352, "type": "attraction", "duration": 0.5, "best_time": "afternoon"},
        
        # Local Experiences
        {"name": "Crawford Market", "tags": ["shopping", "colonial", "fruits", "local"], "popularity": 3.9, "lat": 18.9467, "lng": 72.8342, "type": "local", "duration": 2, "best_time": "morning"},
        {"name": "Dharavi Slum Tour", "tags": ["cultural", "local", "authentic"], "popularity": 4.1, "lat": 19.0423, "lng": 72.8570, "type": "local", "duration": 3, "best_time": "afternoon"},
        {"name": "Dhobi Ghat Laundry", "tags": ["local", "cultural", "photography"], "popularity": 3.8, "lat": 18.9833, "lng": 72.8258, "type": "local", "duration": 1, "best_time": "morning"},
        {"name": "Chor Bazaar Antique Market", "tags": ["shopping", "antiques", "local"], "popularity": 3.7, "lat": 18.9647, "lng": 72.8258, "type": "local", "duration": 2, "best_time": "afternoon"},
        
        # Restaurants & Food
        {"name": "Trishna Restaurant", "tags": ["seafood", "fine_dining", "michelin"], "popularity": 4.6, "lat": 18.9220, "lng": 72.8347, "type": "restaurant", "duration": 2, "best_time": "dinner"},
        {"name": "Mohammed Ali Road Food Street", "tags": ["street_food", "local", "ramadan"], "popularity": 4.2, "lat": 18.9647, "lng": 72.8258, "type": "restaurant", "duration": 2, "best_time": "evening"},
        {"name": "Leopold Cafe", "tags": ["cafe", "historic", "continental"], "popularity": 4.0, "lat": 18.9220, "lng": 72.8310, "type": "restaurant", "duration": 1, "best_time": "lunch"},
        {"name": "Britannia & Co Restaurant", "tags": ["parsi", "heritage", "local"], "popularity": 4.3, "lat": 18.9647, "lng": 72.8258, "type": "restaurant", "duration": 1, "best_time": "lunch"},
        
        # Activities
        {"name": "Bollywood Studio Tour", "tags": ["entertainment", "bollywood", "cultural"], "popularity": 4.2, "lat": 19.0423, "lng": 72.8570, "type": "activity", "duration": 4, "best_time": "afternoon"},
        {"name": "Juhu Beach Sunset Walk", "tags": ["beach", "sunset", "street_food"], "popularity": 4.0, "lat": 19.0990, "lng": 72.8265, "type": "activity", "duration": 2, "best_time": "evening"}
    ],
    "delhi": [
        {"name": "Red Fort", "tags": ["unesco", "mughal", "fort"], "popularity": 4.3, "lat": 28.6562, "lng": 77.2410},
        {"name": "India Gate", "tags": ["monument", "memorial", "british"], "popularity": 4.4, "lat": 28.6129, "lng": 77.2295},
        {"name": "Qutub Minar", "tags": ["unesco", "tower", "islamic"], "popularity": 4.2, "lat": 28.5245, "lng": 77.1855},
        {"name": "Lotus Temple", "tags": ["religious", "bahai", "architecture"], "popularity": 4.5, "lat": 28.5535, "lng": 77.2588},
        {"name": "Humayun's Tomb", "tags": ["unesco", "mughal", "garden"], "popularity": 4.3, "lat": 28.5933, "lng": 77.2507},
        {"name": "Chandni Chowk", "tags": ["shopping", "food", "old_delhi"], "popularity": 4.0, "lat": 28.6506, "lng": 77.2334},
        {"name": "Akshardham Temple", "tags": ["religious", "modern", "hindu"], "popularity": 4.6, "lat": 28.6127, "lng": 77.2773},
        {"name": "Raj Ghat", "tags": ["memorial", "gandhi", "peaceful"], "popularity": 4.1, "lat": 28.6419, "lng": 77.2506}
    ],
    "paris": [
        {"name": "Eiffel Tower", "tags": ["landmark", "iconic", "tower"], "popularity": 4.6, "lat": 48.8584, "lng": 2.2945},
        {"name": "Louvre Museum", "tags": ["museum", "art", "mona_lisa"], "popularity": 4.7, "lat": 48.8606, "lng": 2.3376},
        {"name": "Notre-Dame Cathedral", "tags": ["cathedral", "gothic", "religious"], "popularity": 4.5, "lat": 48.8530, "lng": 2.3499},
        {"name": "Arc de Triomphe", "tags": ["monument", "napoleon", "champs_elysees"], "popularity": 4.4, "lat": 48.8738, "lng": 2.2950},
        {"name": "Sacré-Cœur Basilica", "tags": ["religious", "montmartre", "views"], "popularity": 4.3, "lat": 48.8867, "lng": 2.3431},
        {"name": "Seine River Cruise", "tags": ["cruise", "romantic", "sightseeing"], "popularity": 4.2, "lat": 48.8566, "lng": 2.3522},
        {"name": "Versailles Palace", "tags": ["palace", "royal", "gardens"], "popularity": 4.5, "lat": 48.8049, "lng": 2.1204},
        {"name": "Montmartre District", "tags": ["artistic", "bohemian", "cafes"], "popularity": 4.4, "lat": 48.8867, "lng": 2.3431}
    ],
    "london": [
        # Famous Attractions
        {"name": "Big Ben & Parliament", "tags": ["landmark", "clock", "parliament"], "popularity": 4.5, "lat": 51.4994, "lng": -0.1245, "type": "attraction", "duration": 1, "best_time": "morning"},
        {"name": "Tower Bridge", "tags": ["bridge", "victorian", "thames"], "popularity": 4.4, "lat": 51.5055, "lng": -0.0754, "type": "attraction", "duration": 1.5, "best_time": "afternoon"},
        {"name": "British Museum", "tags": ["museum", "history", "artifacts"], "popularity": 4.7, "lat": 51.5194, "lng": -0.1270, "type": "attraction", "duration": 3, "best_time": "morning"},
        {"name": "Buckingham Palace", "tags": ["palace", "royal", "guards"], "popularity": 4.3, "lat": 51.5014, "lng": -0.1419, "type": "attraction", "duration": 1, "best_time": "morning"},
        {"name": "Tower of London", "tags": ["castle", "crown_jewels", "history"], "popularity": 4.4, "lat": 51.5081, "lng": -0.0759, "type": "attraction", "duration": 2.5, "best_time": "afternoon"},
        
        # Local Experiences
        {"name": "Borough Market", "tags": ["food_market", "local", "artisan"], "popularity": 4.5, "lat": 51.5055, "lng": -0.0909, "type": "local", "duration": 2, "best_time": "morning"},
        {"name": "Camden Market", "tags": ["alternative", "shopping", "local"], "popularity": 4.2, "lat": 51.5414, "lng": -0.1460, "type": "local", "duration": 2.5, "best_time": "afternoon"},
        {"name": "Brick Lane Street Art Tour", "tags": ["street_art", "local", "cultural"], "popularity": 4.1, "lat": 51.5201, "lng": -0.0712, "type": "local", "duration": 2, "best_time": "afternoon"},
        {"name": "Portobello Road Market", "tags": ["antiques", "local", "notting_hill"], "popularity": 4.0, "lat": 51.5158, "lng": -0.2058, "type": "local", "duration": 2, "best_time": "morning"},
        
        # Restaurants & Food
        {"name": "Dishoom", "tags": ["indian", "bombay_cafe", "popular"], "popularity": 4.6, "lat": 51.5201, "lng": -0.0712, "type": "restaurant", "duration": 1.5, "best_time": "dinner"},
        {"name": "Rules Restaurant", "tags": ["british", "historic", "fine_dining"], "popularity": 4.4, "lat": 51.5105, "lng": -0.1209, "type": "restaurant", "duration": 2, "best_time": "dinner"},
        {"name": "Fish & Chips at Poppies", "tags": ["fish_chips", "traditional", "local"], "popularity": 4.2, "lat": 51.5201, "lng": -0.0712, "type": "restaurant", "duration": 1, "best_time": "lunch"},
        {"name": "Afternoon Tea at Fortnum & Mason", "tags": ["afternoon_tea", "luxury", "british"], "popularity": 4.5, "lat": 51.5074, "lng": -0.1372, "type": "restaurant", "duration": 2, "best_time": "afternoon"},
        
        # Activities
        {"name": "Thames River Cruise", "tags": ["cruise", "sightseeing", "thames"], "popularity": 4.3, "lat": 51.5033, "lng": -0.1196, "type": "activity", "duration": 1.5, "best_time": "afternoon"},
        {"name": "West End Theatre Show", "tags": ["theatre", "musical", "entertainment"], "popularity": 4.6, "lat": 51.5105, "lng": -0.1209, "type": "activity", "duration": 3, "best_time": "evening"},
        {"name": "Hyde Park & Speaker's Corner", "tags": ["park", "nature", "speakers_corner"], "popularity": 4.3, "lat": 51.5074, "lng": -0.1657, "type": "activity", "duration": 2, "best_time": "afternoon"}
    ],
    "tokyo": [
        {"name": "Sensō-ji Temple", "tags": ["temple", "buddhist", "asakusa"], "popularity": 4.3, "lat": 35.7148, "lng": 139.7967},
        {"name": "Tokyo Skytree", "tags": ["tower", "modern", "views"], "popularity": 4.1, "lat": 35.7101, "lng": 139.8107},
        {"name": "Shibuya Crossing", "tags": ["crossing", "busy", "modern"], "popularity": 4.2, "lat": 35.6598, "lng": 139.7006},
        {"name": "Meiji Shrine", "tags": ["shrine", "shinto", "peaceful"], "popularity": 4.4, "lat": 35.6764, "lng": 139.6993},
        {"name": "Tsukiji Outer Market", "tags": ["market", "sushi", "food"], "popularity": 4.3, "lat": 35.6654, "lng": 139.7707},
        {"name": "Imperial Palace", "tags": ["palace", "emperor", "gardens"], "popularity": 4.2, "lat": 35.6852, "lng": 139.7528},
        {"name": "Harajuku District", "tags": ["fashion", "youth", "culture"], "popularity": 4.0, "lat": 35.6702, "lng": 139.7026},
        {"name": "Tokyo Disneyland", "tags": ["theme_park", "family", "disney"], "popularity": 4.5, "lat": 35.6329, "lng": 139.8804}
    ]
}

# Pydantic models
class NLPRequest(BaseModel):
    text: str

class NLPResponse(BaseModel):
    destination: str
    days: int
    budget: float
    interests: List[str]
    confidence: Dict[str, float]

class POICandidate(BaseModel):
    name: str
    tags: List[str]
    popularity: float
    lat: Optional[float] = None
    lng: Optional[float] = None

class RecommendRequest(BaseModel):
    preferences: Dict
    destination: str
    poi_candidates: List[POICandidate]

class RecommendResponse(BaseModel):
    name: str
    score: float
    tags: List[str]

class Place(BaseModel):
    name: str
    lat: float
    lng: float
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class DayPlan(BaseModel):
    day: int
    places: List[Place]

class OptimizeRequest(BaseModel):
    poi_list: List[Dict]
    days: int
    daily_time_budget: int

class OptimizeResponse(BaseModel):
    plan: List[DayPlan]

class WeatherDay(BaseModel):
    day: int
    condition: str

class WeatherAdjustRequest(BaseModel):
    plan: List[Dict]
    weather: List[WeatherDay]

class CaptionRequest(BaseModel):
    poi: str
    date: str
    weather: str

class CaptionResponse(BaseModel):
    caption: str

class TextRequest(BaseModel):
    prompt: str

class TextResponse(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "AI Travel Planner ML Service - Real-time, no database"}

@app.post("/nlp/parse", response_model=NLPResponse)
async def parse_nlp(request: NLPRequest):
    """Parse natural language travel queries in real-time"""
    try:
        text = request.text.lower()
        
        # Extract destination using spaCy NER and patterns
        destination = extract_destination(text)
        
        # Extract days
        days = extract_days(text)
        
        # Extract budget
        budget = extract_budget(text)
        
        # Extract interests
        interests = extract_interests(text)
        
        # Calculate confidence scores
        confidence = {
            "destination": 0.95 if destination else 0.3,
            "days": 0.90 if days > 0 else 0.3,
            "budget": 0.92 if budget > 0 else 0.3
        }
        
        return NLPResponse(
            destination=destination or "Unknown",
            days=days or 3,
            budget=budget or 10000,
            interests=interests,
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend", response_model=List[RecommendResponse])
async def recommend_places(request: RecommendRequest):
    """Generate real-time place recommendations using ML"""
    try:
        destination_key = request.destination.lower()
        
        # Get real places for destination
        real_places = get_real_places_for_destination(destination_key)
        
        # Combine with provided candidates
        all_candidates = real_places + [poi.dict() for poi in request.poi_candidates]
        
        if not all_candidates:
            return []
        
        # Extract user interests
        user_interests = request.preferences.get("interests", [])
        
        # Calculate scores using TF-IDF and cosine similarity
        scores = calculate_recommendation_scores(all_candidates, user_interests)
        
        # Sort by score and return top recommendations
        recommendations = []
        for i, candidate in enumerate(all_candidates):
            recommendations.append(RecommendResponse(
                name=candidate["name"],
                score=scores[i],
                tags=candidate["tags"]
            ))
        
        # Sort by score descending
        recommendations.sort(key=lambda x: x.score, reverse=True)
        
        return recommendations[:20]  # Return top 20
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize", response_model=OptimizeResponse)
async def optimize_itinerary(request: OptimizeRequest):
    """Create optimized full-day itinerary with no duplicates and proper scheduling"""
    try:
        poi_list = request.poi_list
        days = request.days
        daily_time_budget = request.daily_time_budget
        
        if not poi_list:
            return OptimizeResponse(plan=[])
        
        # Advanced optimization with diversity and full-day planning
        plan = []
        used_places = set()  # Track used places to avoid duplicates
        
        for day in range(1, days + 1):
            places = []
            current_time = 9.0  # Start at 9:00 AM
            day_end_time = 21.0  # End at 9:00 PM
            
            # Get available places (not used yet)
            available_places = [p for p in poi_list if p["name"] not in used_places]
            
            if not available_places:
                # If we've used all places, we can reuse some but with different timing
                available_places = poi_list
            
            # Categorize places by type for better day planning
            attractions = [p for p in available_places if p.get("type") == "attraction"]
            restaurants = [p for p in available_places if p.get("type") == "restaurant"]
            local_exp = [p for p in available_places if p.get("type") == "local"]
            activities = [p for p in available_places if p.get("type") == "activity"]
            
            # Plan a full day with variety
            day_schedule = []
            
            # Morning (9:00-12:00): Major attraction or activity
            morning_options = [p for p in attractions + activities if p.get("best_time") in ["morning", None]]
            if morning_options:
                place = morning_options[0]
                duration = place.get("duration", 2)
                day_schedule.append({
                    "place": place,
                    "start_time": current_time,
                    "duration": duration,
                    "period": "morning"
                })
                current_time += duration
                used_places.add(place["name"])
            
            # Lunch (12:00-14:00): Restaurant
            if current_time <= 14.0:
                lunch_options = [p for p in restaurants if p.get("best_time") in ["lunch", None]]
                if lunch_options:
                    place = lunch_options[0]
                    day_schedule.append({
                        "place": place,
                        "start_time": max(current_time, 12.0),
                        "duration": 1.5,
                        "period": "lunch"
                    })
                    current_time = max(current_time, 12.0) + 1.5
                    used_places.add(place["name"])
            
            # Afternoon (14:00-17:00): Local experience or attraction
            if current_time <= 17.0:
                afternoon_options = [p for p in local_exp + attractions if p.get("best_time") in ["afternoon", None] and p["name"] not in used_places]
                if afternoon_options:
                    place = afternoon_options[0]
                    duration = place.get("duration", 2)
                    day_schedule.append({
                        "place": place,
                        "start_time": current_time,
                        "duration": duration,
                        "period": "afternoon"
                    })
                    current_time += duration
                    used_places.add(place["name"])
            
            # Evening (17:00-21:00): Sunset activity or dinner
            if current_time <= 19.0:
                evening_options = [p for p in activities + restaurants if p.get("best_time") in ["evening", "dinner", None] and p["name"] not in used_places]
                if evening_options:
                    place = evening_options[0]
                    duration = place.get("duration", 2)
                    day_schedule.append({
                        "place": place,
                        "start_time": max(current_time, 17.0),
                        "duration": duration,
                        "period": "evening"
                    })
                    used_places.add(place["name"])
            
            # Convert schedule to places
            for item in day_schedule:
                start_hour = int(item["start_time"])
                start_min = int((item["start_time"] % 1) * 60)
                end_time = item["start_time"] + item["duration"]
                end_hour = int(end_time)
                end_min = int((end_time % 1) * 60)
                
                places.append(Place(
                    name=item["place"]["name"],
                    lat=item["place"].get("lat", 0.0),
                    lng=item["place"].get("lng", 0.0),
                    start_time=f"{start_hour:02d}:{start_min:02d}",
                    end_time=f"{end_hour:02d}:{end_min:02d}"
                ))
            
            if places:
                plan.append(DayPlan(day=day, places=places))
        
        return OptimizeResponse(plan=plan)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/weather-adjust")
async def adjust_for_weather(request: WeatherAdjustRequest):
    """Adjust itinerary based on weather conditions"""
    try:
        plan = request.plan
        weather = request.weather
        
        # Create weather lookup
        weather_by_day = {w.day: w.condition for w in weather}
        
        adjusted_plan = []
        notes = []
        
        for day_plan in plan:
            day_num = day_plan["day"]
            condition = weather_by_day.get(day_num, "Sunny")
            
            if condition.lower() in ["rain", "storm", "thunderstorm"]:
                # Suggest indoor alternatives
                notes.append(f"Day {day_num}: Recommended indoor activities due to {condition.lower()}")
            
            adjusted_plan.append(day_plan)
        
        return {
            "plan": adjusted_plan,
            "notes": notes
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/postcard/caption", response_model=CaptionResponse)
async def generate_caption(request: CaptionRequest):
    """Generate creative captions for postcards"""
    try:
        poi = request.poi
        weather = request.weather
        
        # Generate creative caption based on POI and weather
        captions = {
            "sunny": f"Golden sunshine and amazing vibes at {poi}! ☀️",
            "cloudy": f"Moody skies and beautiful moments at {poi} 🌤️",
            "rain": f"Dancing in the rain at {poi} - unforgettable memories! 🌧️",
            "clear": f"Crystal clear views and perfect moments at {poi} ✨"
        }
        
        caption = captions.get(weather.lower(), f"Amazing experience at {poi}! 🌟")
        
        return CaptionResponse(caption=caption)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-text", response_model=TextResponse)
async def generate_text(request: TextRequest):
    """Generate dynamic travel stories based on prompt details"""
    try:
        prompt = request.prompt
        story = generate_dynamic_story(prompt)
        return TextResponse(text=story)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
def extract_destination(text: str) -> str:
    """Extract destination from text using patterns and NER"""
    # Common destination patterns
    destinations = ["goa", "mumbai", "delhi", "paris", "london", "tokyo", "new york", "rome", "barcelona", "amsterdam"]
    
    for dest in destinations:
        if dest in text:
            return dest.title()
    
    # Use spaCy NER if available
    if nlp:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["GPE", "LOC"]:  # Geopolitical entity or location
                return ent.text.title()
    
    return ""

def extract_days(text: str) -> int:
    """Extract number of days from text"""
    patterns = [
        r"(\d+)\s*days?",
        r"(\d+)\s*day",
        r"for\s*(\d+)\s*days?",
        r"(\d+)[-\s]*day"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return int(match.group(1))
    
    return 0

def extract_budget(text: str) -> float:
    """Extract budget from text"""
    patterns = [
        r"₹\s*(\d+(?:,\d+)*)",
        r"rs\.?\s*(\d+(?:,\d+)*)",
        r"rupees?\s*(\d+(?:,\d+)*)",
        r"\$\s*(\d+(?:,\d+)*)",
        r"budget\s*(?:of\s*)?₹?\s*(\d+(?:,\d+)*)",
        r"under\s*₹?\s*(\d+(?:,\d+)*)"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            amount_str = match.group(1).replace(",", "")
            return float(amount_str)
    
    return 0

def extract_interests(text: str) -> List[str]:
    """Extract interests from text"""
    interest_keywords = {
        "beach": ["beach", "beaches", "sea", "ocean", "sand", "swimming"],
        "food": ["food", "cuisine", "restaurant", "dining", "eat", "culinary"],
        "history": ["history", "historical", "heritage", "ancient", "museum"],
        "nature": ["nature", "natural", "wildlife", "park", "garden", "outdoor"],
        "adventure": ["adventure", "trekking", "hiking", "sports", "thrill"],
        "nightlife": ["nightlife", "party", "club", "bar", "night"],
        "shopping": ["shopping", "market", "mall", "boutique", "shop"],
        "art": ["art", "gallery", "culture", "cultural", "artistic"],
        "religious": ["temple", "church", "mosque", "religious", "spiritual"],
        "architecture": ["architecture", "building", "monument", "fort"]
    }
    
    found_interests = []
    text_lower = text.lower()
    
    for interest, keywords in interest_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            found_interests.append(interest)
    
    return found_interests

def get_real_places_for_destination(destination: str) -> List[Dict]:
    """Get real places for a destination"""
    destination_key = destination.lower()
    
    # Direct match
    if destination_key in REAL_PLACES_DB:
        return REAL_PLACES_DB[destination_key].copy()
    
    # Partial match
    for key in REAL_PLACES_DB:
        if key in destination_key or destination_key in key:
            return REAL_PLACES_DB[key].copy()
    
    # Default to a mix of places if no match
    all_places = []
    for places in REAL_PLACES_DB.values():
        all_places.extend(places[:2])  # Take 2 from each destination
    
    return all_places[:10]  # Return top 10

def calculate_recommendation_scores(candidates: List[Dict], user_interests: List[str]) -> List[float]:
    """Calculate recommendation scores using TF-IDF and cosine similarity"""
    if not candidates:
        return []
    
    # Prepare documents for TF-IDF
    documents = []
    for candidate in candidates:
        tags_text = " ".join(candidate.get("tags", []))
        documents.append(tags_text)
    
    # User interests as a document
    user_doc = " ".join(user_interests)
    documents.append(user_doc)
    
    if len(set(documents)) < 2:  # Not enough unique documents
        # Return popularity-based scores
        return [candidate.get("popularity", 3.0) / 5.0 for candidate in candidates]
    
    # Calculate TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    # Calculate cosine similarity with user interests
    user_vector = tfidf_matrix[-1]  # Last document is user interests
    candidate_vectors = tfidf_matrix[:-1]  # All except last
    
    similarities = cosine_similarity(candidate_vectors, user_vector).flatten()
    
    # Combine with popularity scores
    scores = []
    for i, candidate in enumerate(candidates):
        similarity_score = similarities[i] if i < len(similarities) else 0
        popularity_score = candidate.get("popularity", 3.0) / 5.0  # Normalize to 0-1
        
        # Weighted combination
        final_score = 0.7 * similarity_score + 0.3 * popularity_score
        scores.append(min(1.0, max(0.0, final_score)))  # Clamp to 0-1
    
    return scores

def generate_dynamic_story(prompt: str) -> str:
    """Generate a dynamic, personalized travel story based on prompt components"""
    text = prompt.lower()
    
    # Extract components from prompt using regex
    title_match = re.search(r"trip:\s*(.+?)(?:\n|$)", text)
    highlight_match = re.search(r"highlight:\s*(.+?)(?:\n|$)", text)
    style_match = re.search(r"style:\s*(.+?)(?:\n|$)", text)
    location_match = re.search(r"when & where:\s*(.+?)(?:\n|$)", text)
    
    title = title_match.group(1).strip().title() if title_match else "The Journey"
    highlight = highlight_match.group(1).strip() if highlight_match else "every moment was a discovery"
    style = style_match.group(1).strip() if style_match else "nostalgic"
    location = location_match.group(1).strip() if location_match else ""
    
    # Pools of thematic sentences
    intros = [
        f"Our time in {title} was more than just a destination; it was a feeling that settled deep in the soul.",
        f"They say some places change you, and {title} certainly left its mark on us.",
        f"The spirit of {title} greeted us with open arms, promising adventures we'd never forget.",
        f"Wandering through {title}, we found ourselves lost in a world where time seemed to stand still.",
        f"Every corner of {title} told a different story, but none as beautiful as ours."
    ]
    
    sensory_details = [
        "The air carried a sweet hint of local spices and the distant murmur of the city.",
        "Golden light spilled across the ancient stones, casting long shadows of wonder.",
        "We could hear the rhythmic pulse of life in every bustling street and quiet alleyway.",
        "The scent of fresh rain on warm pavement mixed with the salty tang of the breeze.",
        "A symphony of colors painted the horizon, shifting from deep amber to a bruised violet."
    ]
    
    transitions = [
        "Everything shifted the moment we experienced it.",
        "The true magic happened when we least expected it.",
        "In the middle of our wandering, one moment stood out above the rest.",
        "Nothing could have prepared us for the raw beauty of that experience.",
        "It was a day defined by a single, breathtaking realization."
    ]
    
    highlights_intro = [
        f"I'll never forget the way {highlight.lower()}.",
        f"The highlight of our trip was undoubtedly when {highlight.lower()}.",
        f"Looking back, the most vivid memory is of {highlight.lower()}.",
        f"It was {highlight.lower()} that finally made it all feel real.",
        f"Our hearts skipped a beat as {highlight.lower()}."
    ]
    
    conclusions = [
        f"It wasn't just about the sights; it was about the way {title} made us feel.",
        f"As we left, we carried a piece of {title} back home with us in our memories.",
        f"Some memories are etched in light, and this trip to {title} is one of them.",
        f"It was the kind of journey that stays with you long after the bags are unpacked.",
        "A collection of beautiful moments, woven together into a story we'll tell forever."
    ]
    
    # Select randomized components
    import random
    
    # Seed with the title to ensure consistency for the same trip but variety between trips
    random.seed(title + highlight)
    
    intro = random.choice(intros)
    sensory = random.choice(sensory_details)
    transition = random.choice(transitions)
    h_intro = random.choice(highlights_intro)
    conclusion = random.choice(conclusions)
    
    # Vary the structure based on style
    if "soft" in style or "nostalgic" in style:
        story = f"{intro} {sensory} {h_intro} {transition} {conclusion}"
    elif "lively" in style or "energetic" in style:
        story = f"{title} was an explosion of life! {sensory} {h_intro} {transition} What an incredible adventure. {conclusion}"
    else:
        story = f"{intro} {h_intro} {sensory} {transition} {conclusion}"
        
    return story

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)