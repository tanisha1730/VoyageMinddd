# Get Real API Keys (Takes 5 Minutes)

## 🗺️ Google Maps API Key (FREE - 200 requests/day)

1. Go to: https://console.cloud.google.com/
2. Click "Create Project" → Name it "Travel Planner"
3. Go to "APIs & Services" → "Library"
4. Enable these APIs:
   - Places API
   - Geocoding API
   - Maps JavaScript API
5. Go to "Credentials" → "Create Credentials" → "API Key"
6. Copy the API key

## 🌤️ OpenWeatherMap API Key (FREE - 1000 requests/day)

1. Go to: https://openweathermap.org/api
2. Click "Sign Up" (free account)
3. Verify email
4. Go to "API Keys" tab
5. Copy the default API key

## 🔧 Update Your .env File

Replace in `backend/.env`:
```
GOOGLE_MAPS_API_KEY=your_actual_google_key_here
OPENWEATHER_KEY=your_actual_weather_key_here
```

## ⚡ Then restart backend:
```
npm run dev
```

**Total time: 5 minutes for REAL data!**