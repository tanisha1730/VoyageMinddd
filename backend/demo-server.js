const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Demo data
const demoUser = {
  _id: 'demo_user_123',
  name: 'Demo User',
  email: 'demo@example.com',
  preferences: {
    budget: 'medium',
    interests: ['art', 'food', 'culture']
  },
  created_at: new Date()
};

const demoItineraries = [
  {
    _id: 'demo_itinerary_1',
    user_id: 'demo_user_123',
    destination: 'Paris, France',
    days: 3,
    budget: 2000,
    plan: [
      {
        day: 1,
        places: [
          {
            place_id: 'paris_eiffel_tower',
            name: 'Eiffel Tower',
            start_time: '09:00',
            end_time: '11:00',
            category: ['tourist_attraction'],
            rating: 4.6,
            entry_fee: 29,
            tags: ['iconic', 'views']
          },
          {
            place_id: 'paris_louvre',
            name: 'Louvre Museum',
            start_time: '14:00',
            end_time: '17:00',
            category: ['museum'],
            rating: 4.7,
            entry_fee: 17,
            tags: ['art', 'culture']
          }
        ]
      }
    ],
    generated_on: new Date(),
    format: 'standard'
  }
];

const demoMemories = [
  {
    _id: 'demo_memory_1',
    user_id: 'demo_user_123',
    title: 'Beautiful Sunset in Paris',
    image_url: 'https://via.placeholder.com/400x400/ff6b6b/ffffff?text=Paris+Sunset',
    note: 'Amazing view from the Eiffel Tower!',
    caption: 'Watching the sunset from the iconic Eiffel Tower - pure magic!',
    created_on: new Date(),
    tags: ['sunset', 'paris', 'romantic']
  }
];

// Demo routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Demo server running', timestamp: new Date().toISOString() });
});

// Auth routes (demo)
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      message: 'Login successful (demo)',
      user: demoUser,
      access_token: 'demo_access_token_123',
      refresh_token: 'demo_refresh_token_123'
    });
  } else {
    res.status(400).json({ error: 'Email and password required' });
  }
});

app.post('/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (name && email && password) {
    res.status(201).json({
      message: 'User created successfully (demo)',
      user: { ...demoUser, name, email },
      access_token: 'demo_access_token_123',
      refresh_token: 'demo_refresh_token_123'
    });
  } else {
    res.status(400).json({ error: 'Name, email and password required' });
  }
});

// Itineraries routes (demo)
app.get('/itineraries', (req, res) => {
  res.json({
    itineraries: demoItineraries,
    total: demoItineraries.length,
    has_more: false
  });
});

app.post('/itineraries', (req, res) => {
  const { destination, days, budget } = req.body;
  const newItinerary = {
    _id: 'demo_itinerary_' + Date.now(),
    user_id: 'demo_user_123',
    destination: destination || 'Demo Destination',
    days: days || 3,
    budget: budget || 1000,
    plan: [
      {
        day: 1,
        places: [
          {
            place_id: 'demo_place_1',
            name: `Amazing Place in ${destination || 'Demo City'}`,
            start_time: '09:00',
            end_time: '12:00',
            category: ['tourist_attraction'],
            rating: 4.5,
            entry_fee: 15,
            tags: ['popular', 'scenic']
          }
        ]
      }
    ],
    generated_on: new Date(),
    format: 'standard'
  };
  
  res.status(201).json({
    itinerary: newItinerary,
    ml_service_available: false,
    message: 'Demo itinerary created successfully'
  });
});

app.get('/itineraries/:id', (req, res) => {
  const itinerary = demoItineraries.find(i => i._id === req.params.id) || demoItineraries[0];
  res.json(itinerary);
});

// Memories routes (demo)
app.get('/memories', (req, res) => {
  res.json({
    memories: demoMemories,
    total: demoMemories.length,
    has_more: false
  });
});

// Places routes (demo)
app.get('/places/search', (req, res) => {
  const demoPlaces = [
    {
      place_id: 'demo_place_1',
      name: 'Demo Museum',
      category: ['museum'],
      location: { lat: 48.8606, lng: 2.3376 },
      rating: 4.5,
      city: 'Demo City',
      country: 'Demo Country',
      tags: ['art', 'culture']
    },
    {
      place_id: 'demo_place_2',
      name: 'Demo Park',
      category: ['park'],
      location: { lat: 48.8566, lng: 2.3522 },
      rating: 4.2,
      city: 'Demo City',
      country: 'Demo Country',
      tags: ['nature', 'relaxing']
    }
  ];
  
  res.json({
    places: demoPlaces,
    total: demoPlaces.length,
    has_more: false
  });
});

// ML routes (demo - fallback responses)
app.post('/ml/nlp/parse', (req, res) => {
  const { text } = req.body;
  res.json({
    destination: 'Paris',
    days: 3,
    budget: 1500,
    interests: ['art', 'food'],
    confidence: {
      destination: 0.8,
      days: 0.9,
      budget: 0.7
    }
  });
});

// Export routes (demo)
app.post('/export/pdf', (req, res) => {
  res.status(503).json({ 
    error: 'PDF export not available in demo mode',
    message: 'This feature requires the full backend with Puppeteer'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Demo server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found in demo server`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Demo server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 Backend API: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('🎯 Demo Features Available:');
  console.log('  ✅ User authentication (demo)');
  console.log('  ✅ Itinerary creation (demo)');
  console.log('  ✅ Places search (demo)');
  console.log('  ✅ Basic NLP parsing (demo)');
  console.log('  ❌ Full ML service (requires Python setup)');
  console.log('  ❌ PDF export (requires Puppeteer)');
  console.log('  ❌ Database persistence (using in-memory data)');
});

module.exports = app;