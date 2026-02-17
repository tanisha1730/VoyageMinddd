# Real-time ML service — no database used.
import requests
import json

BASE_URL = "http://localhost:8000"

def test_nlp_parse():
    """Test NLP parsing endpoint"""
    print("🧠 Testing NLP Parse...")
    
    test_cases = [
        "Plan me a 5-day trip to Goa under ₹15,000 for beaches and food.",
        "I want to visit Paris for 3 days with $2000 budget, love art and history",
        "Mumbai trip for 2 days, interested in food and nightlife",
        "Tokyo adventure for a week, budget 50000 rupees"
    ]
    
    for text in test_cases:
        response = requests.post(f"{BASE_URL}/nlp/parse", json={"text": text})
        print(f"Input: {text}")
        print(f"Output: {response.json()}")
        print("-" * 50)

def test_recommend():
    """Test recommendation endpoint"""
    print("🎯 Testing Recommendations...")
    
    payload = {
        "preferences": {
            "budget": "medium",
            "interests": ["beach", "food"]
        },
        "destination": "Goa",
        "poi_candidates": [
            {"name": "Custom Beach", "tags": ["beach", "sunset"], "popularity": 4.0},
            {"name": "Local Restaurant", "tags": ["food", "local"], "popularity": 4.2}
        ]
    }
    
    response = requests.post(f"{BASE_URL}/recommend", json=payload)
    print(f"Input: {json.dumps(payload, indent=2)}")
    print(f"Output: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)

def test_optimize():
    """Test itinerary optimization"""
    print("⚡ Testing Optimization...")
    
    payload = {
        "poi_list": [
            {"name": "Baga Beach", "lat": 15.5557, "lng": 73.7516},
            {"name": "Fort Aguada", "lat": 15.4909, "lng": 73.7732},
            {"name": "Basilica of Bom Jesus", "lat": 15.5008, "lng": 73.9115}
        ],
        "days": 2,
        "daily_time_budget": 8
    }
    
    response = requests.post(f"{BASE_URL}/optimize", json=payload)
    print(f"Input: {json.dumps(payload, indent=2)}")
    print(f"Output: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)

def test_weather_adjust():
    """Test weather adjustment"""
    print("🌦️ Testing Weather Adjustment...")
    
    payload = {
        "plan": [
            {
                "day": 1,
                "places": [
                    {"name": "Baga Beach", "start_time": "10:00", "end_time": "12:00"}
                ]
            }
        ],
        "weather": [
            {"day": 1, "condition": "Rain"}
        ]
    }
    
    response = requests.post(f"{BASE_URL}/weather-adjust", json=payload)
    print(f"Input: {json.dumps(payload, indent=2)}")
    print(f"Output: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)

def test_caption():
    """Test caption generation"""
    print("📸 Testing Caption Generation...")
    
    payload = {
        "poi": "Baga Beach",
        "date": "2025-12-21",
        "weather": "Sunny"
    }
    
    response = requests.post(f"{BASE_URL}/postcard/caption", json=payload)
    print(f"Input: {json.dumps(payload, indent=2)}")
    print(f"Output: {response.json()}")
    print("-" * 50)

if __name__ == "__main__":
    print("🚀 Testing AI Travel Planner ML Service")
    print("=" * 60)
    
    try:
        # Test health endpoint
        response = requests.get(f"{BASE_URL}/")
        print(f"Health Check: {response.json()}")
        print("-" * 50)
        
        # Run all tests
        test_nlp_parse()
        test_recommend()
        test_optimize()
        test_weather_adjust()
        test_caption()
        
        print("✅ All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to ML service. Make sure it's running on port 8000")
        print("Run: uvicorn main:app --reload")
    except Exception as e:
        print(f"❌ Test failed: {e}")