# 🔑 API Setup Guide - Get Real Data for Your Travel Planner

This guide will help you set up real API keys to get actual places and weather data instead of fake/template data.

## 🌍 Google Maps API Setup (For Real Places Data)

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Maps API)

### Step 2: Enable Required APIs
Enable these APIs in your project:
- **Places API** (for real place data)
- **Geocoding API** (for location coordinates)
- **Maps JavaScript API** (for map display)

### Step 3: Create API Key
1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "API Key"
3. Copy your API key
4. **Important**: Restrict your API key:
   - Go to "API restrictions"
   - Select "Restrict key"
   - Choose the APIs you enabled above

### Step 4: Add to Environment
Replace in `backend/.env`:
```env
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
```

Replace in `frontend/.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
```

## 🌤️ OpenWeather API Setup (For Real Weather Data)

### Step 1: Sign Up
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Free tier includes 1,000 calls/day

### Step 2: Get API Key
1. Go to your account dashboard
2. Find your API key in the "API keys" tab
3. Copy the key

### Step 3: Add to Environment
Replace in `backend/.env`:
```env
OPENWEATHER_KEY=your_actual_openweather_api_key_here
```

## 🚀 Testing Your Setup

### Test Google Places API
```bash
# In backend directory
cd backend
npm test -- --grep "Google Places"
```

### Test Weather API
```bash
# In backend directory
npm test -- --grep "Weather"
```

### Manual Test
1. Start your backend: `npm run dev`
2. Create a new itinerary for a real city (e.g., "Paris, France")
3. Check the console logs - you should see:
   - ✅ "Using Google Places API..."
   - ✅ "Found X real places"
   - ✅ "Using OpenWeather API..."

## 🔧 Troubleshooting

### Google Places API Issues
- **"API key not valid"**: Check if you enabled the required APIs
- **"This API project is not authorized"**: Add API restrictions
- **"Quota exceeded"**: You've hit the free tier limit

### Weather API Issues
- **"Invalid API key"**: Check if you copied the key correctly
- **"City not found"**: The API might not recognize the city name format

### Still Getting Fake Data?
If you're still seeing fake/template places:

1. **Check your API keys are set correctly**:
   ```bash
   # In backend directory
   node -e "console.log('Google:', process.env.GOOGLE_MAPS_API_KEY?.substring(0,10) + '...'); console.log('Weather:', process.env.OPENWEATHER_KEY?.substring(0,10) + '...');"
   ```

2. **Restart your backend server** after adding API keys

3. **Clear any cached data** and try generating a new itinerary

## 💰 API Costs (Free Tiers)

### Google Maps APIs
- **Places API**: $17 per 1,000 requests (first $200/month free)
- **Geocoding API**: $5 per 1,000 requests (first $200/month free)
- **Maps JavaScript API**: $7 per 1,000 loads (first $200/month free)

### OpenWeather API
- **Current Weather**: Free up to 1,000 calls/day
- **5-day Forecast**: Free up to 1,000 calls/day

## 🛡️ Security Best Practices

1. **Restrict API Keys**: Always add domain/IP restrictions
2. **Monitor Usage**: Set up billing alerts
3. **Environment Variables**: Never commit API keys to version control
4. **Rotate Keys**: Regularly rotate your API keys

## 🎯 Expected Results

With real API keys, you should get:

### Real Places Data
- ✅ Actual tourist attractions (Eiffel Tower, Big Ben, etc.)
- ✅ Real ratings and reviews
- ✅ Accurate addresses and coordinates
- ✅ Current opening hours
- ✅ Real photos from Google

### Real Weather Data
- ✅ Current weather conditions
- ✅ 5-day accurate forecasts
- ✅ Temperature, humidity, wind speed
- ✅ Weather-based activity recommendations

### Enhanced Features
- ✅ Interactive maps with real locations
- ✅ Weather-optimized itineraries
- ✅ ML-powered recommendations based on real data
- ✅ Direct links to Google Maps for navigation

## 📞 Support

If you're still having issues:
1. Check the console logs for specific error messages
2. Verify your API keys are active and have proper permissions
3. Make sure you've enabled billing for Google Cloud (required for Maps APIs)
4. Try testing with a well-known city like "Paris, France" or "New York, USA"

---

**Note**: The system will automatically fall back to our comprehensive real places database if API keys are not available, but you'll get the best experience with real API integration!