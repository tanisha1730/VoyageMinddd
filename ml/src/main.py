from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from .models import *
from .services.nlp_service import NLPService
from .services.recommendation_service import RecommendationService
from .services.optimization_service import OptimizationService
from .services.weather_service import WeatherService
from .services.postcard_service import PostcardService

load_dotenv()

app = FastAPI(
    title="AI Travel Planner ML Service",
    description="Machine Learning microservice for travel planning",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
ML_SERVICE_SECRET = os.getenv("ML_SERVICE_SECRET")

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    if not ML_SERVICE_SECRET or credentials.credentials != ML_SERVICE_SECRET:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return credentials

# Initialize services
nlp_service = NLPService()
recommendation_service = RecommendationService()
optimization_service = OptimizationService()
weather_service = WeatherService()
postcard_service = PostcardService()

@app.get("/")
async def root():
    return {"message": "AI Travel Planner ML Service", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "services": ["nlp", "recommendation", "optimization", "weather", "postcard"]}

@app.post("/nlp/parse", response_model=NLPParseResponse)
async def parse_nlp(request: NLPParseRequest, token: str = Depends(verify_token)):
    """
    Parse natural language travel request and extract structured information.
    
    Example input: "I want to visit Paris for 5 days with a budget of 2000 euros, interested in art and food"
    
    Returns structured data with confidence scores.
    """
    try:
        result = nlp_service.parse_travel_request(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP parsing failed: {str(e)}")

@app.post("/recommend", response_model=list[RecommendationResponse])
async def get_recommendations(request: RecommendationRequest, token: str = Depends(verify_token)):
    """
    Get personalized place recommendations based on user preferences and POI candidates.
    
    Uses TF-IDF and cosine similarity to score places based on user interests.
    """
    try:
        recommendations = recommendation_service.get_recommendations(
            request.user_id,
            request.preferences,
            request.destination,
            request.poi_candidates
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_itinerary(request: OptimizationRequest, token: str = Depends(verify_token)):
    """
    Optimize itinerary routing and scheduling.
    
    Supports both greedy and genetic algorithm approaches.
    Query parameter 'mode' can be 'greedy' or 'genetic' (default: greedy).
    """
    try:
        mode = request.mode if hasattr(request, 'mode') else 'greedy'
        optimized = optimization_service.optimize_itinerary(
            request.poi_list,
            request.start_location,
            request.daily_time_budget,
            request.days,
            request.opening_hours,
            request.distance_matrix,
            mode
        )
        return optimized
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.post("/weather-adjust", response_model=WeatherAdjustResponse)
async def adjust_for_weather(request: WeatherAdjustRequest, token: str = Depends(verify_token)):
    """
    Adjust itinerary based on weather conditions.
    
    Swaps outdoor activities with indoor alternatives during bad weather.
    """
    try:
        adjusted = weather_service.adjust_itinerary(request.itinerary, request.weather_forecast)
        return adjusted
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather adjustment failed: {str(e)}")

@app.post("/postcard/caption", response_model=PostcardCaptionResponse)
async def generate_postcard_caption(request: PostcardCaptionRequest, token: str = Depends(verify_token)):
    """
    Generate a caption for a travel postcard.
    
    Creates personalized captions based on location, date, weather, and optional image features.
    """
    try:
        caption = postcard_service.generate_caption(
            request.poi,
            request.date,
            request.weather,
            request.image_features
        )
        return PostcardCaptionResponse(caption=caption)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Caption generation failed: {str(e)}")

@app.post("/generate-text")
async def generate_text(request: dict):
    """Generate dynamic travel stories based on prompt details"""
    try:
        prompt = request.get("prompt", "")
        # Use a simplified version of the dynamic logic here for the internal service
        import re
        import random
        text = prompt.lower()
        title_match = re.search(r"trip:\s*(.+?)(?:\n|$)", text)
        highlight_match = re.search(r"highlight:\s*(.+?)(?:\n|$)", text)
        title = title_match.group(1).strip().title() if title_match else "The Journey"
        highlight = highlight_match.group(1).strip() if highlight_match else "every moment was a discovery"
        
        stories = [
            f"Our time in {title} was unforgettable. {highlight.capitalize()} was the highlight that made it all feel real. The atmosphere was magical, and we carried those memories home forever.",
            f"Wandering through {title}, we found beauty in the unexpected. The way {highlight.lower()} really stood out to us. It was a trip of a lifetime.",
            f"The spirit of {title} was everywhere we looked. I'll never forget how {highlight.lower()}. Cinematic, warm, and simply perfect."
        ]
        return {"text": random.choice(stories)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)