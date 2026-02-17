const axios = require('axios');

async function testOverpassAPI() {
  console.log('🧪 Testing Overpass API for London...');
  
  // London coordinates
  const lat = 51.5074;
  const lng = -0.1278;
  const radius = 3000;
  
  const query = `
    [out:json][timeout:15];
    (
      node["tourism"="attraction"](around:${radius},${lat},${lng});
      way["tourism"="attraction"](around:${radius},${lat},${lng});
      node["tourism"="museum"](around:${radius},${lat},${lng});
      way["tourism"="museum"](around:${radius},${lat},${lng});
      node["historic"="monument"](around:${radius},${lat},${lng});
      way["historic"="monument"](around:${radius},${lat},${lng});
      node["historic"="castle"](around:${radius},${lat},${lng});
      way["historic"="castle"](around:${radius},${lat},${lng});
      node["leisure"="park"](around:${radius},${lat},${lng});
      way["leisure"="park"](around:${radius},${lat},${lng});
    );
    out center 100;
  `;

  try {
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      {
        headers: { 
          'Content-Type': 'text/plain',
          'User-Agent': 'AI-Travel-Planner/1.0'
        },
        timeout: 20000
      }
    );

    const elements = response.data.elements || [];
    console.log(`✅ Got ${elements.length} elements from Overpass API`);
    
    const placesWithNames = elements.filter(el => el.tags && el.tags.name);
    console.log(`✅ ${placesWithNames.length} have names`);
    
    console.log('\n📝 First 10 places:');
    placesWithNames.slice(0, 10).forEach((el, i) => {
      console.log(`${i + 1}. ${el.tags.name} (${el.tags.tourism || el.tags.amenity || el.tags.leisure || el.tags.historic})`);
    });
    
  } catch (error) {
    console.error('❌ Overpass API failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testOverpassAPI();
