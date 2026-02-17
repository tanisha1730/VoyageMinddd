const realPlacesDatabase = {
  // MALDIVES
  'maldives': [
    {
      place_id: 'male_fish_market',
      name: 'Malé Fish Market',
      category: ['market', 'local', 'tourist_attraction'],
      location: { lat: 4.1755, lng: 73.5093 },
      rating: 4.2,
      entry_fee: 0,
      tags: ['local', 'market', 'culture', 'authentic'],
      description: 'Vibrant local fish market showcasing fresh catches and Maldivian daily life',
      address: 'Boduthakurufaanu Magu, Malé, Maldives',
      city: 'Malé'
    },
    {
      place_id: 'grand_friday_mosque',
      name: 'Grand Friday Mosque',
      category: ['mosque', 'religious', 'landmark'],
      location: { lat: 4.1753, lng: 73.5089 },
      rating: 4.5,
      entry_fee: 5,
      tags: ['religious', 'architecture', 'landmark', 'culture'],
      description: 'Stunning Islamic center with golden dome, largest mosque in Maldives',
      address: 'Medhuziyaaraiy Magu, Malé, Maldives',
      city: 'Malé'
    },
    {
      place_id: 'artificial_beach_male',
      name: 'Artificial Beach',
      category: ['beach', 'recreation', 'tourist_attraction'],
      location: { lat: 4.1742, lng: 73.5115 },
      rating: 4.0,
      entry_fee: 0,
      tags: ['beach', 'swimming', 'recreation', 'local'],
      description: 'Popular beach area for swimming and water sports in Malé',
      address: 'Boduthakurufaanu Magu, Malé, Maldives',
      city: 'Malé'
    },
    {
      place_id: 'national_museum_maldives',
      name: 'National Museum',
      category: ['museum', 'culture', 'tourist_attraction'],
      location: { lat: 4.1756, lng: 73.5087 },
      rating: 4.3,
      entry_fee: 10,
      tags: ['museum', 'history', 'culture', 'artifacts'],
      description: 'Museum showcasing Maldivian history, culture, and royal artifacts',
      address: 'Chaandhanee Magu, Malé, Maldives',
      city: 'Malé'
    },
    {
      place_id: 'hulhumale_beach',
      name: 'Hulhumalé Beach',
      category: ['beach', 'nature', 'tourist_attraction'],
      location: { lat: 4.2167, lng: 73.5400 },
      rating: 4.6,
      entry_fee: 0,
      tags: ['beach', 'pristine', 'swimming', 'sunset'],
      description: 'Beautiful white sand beach with crystal clear waters, perfect for swimming',
      address: 'Hulhumalé, Maldives',
      city: 'Hulhumalé'
    },
    {
      place_id: 'sultan_park',
      name: 'Sultan Park',
      category: ['park', 'nature', 'recreation'],
      location: { lat: 4.1758, lng: 73.5086 },
      rating: 4.1,
      entry_fee: 0,
      tags: ['park', 'garden', 'relaxation', 'nature'],
      description: 'Peaceful public park with tropical plants and shaded walkways',
      address: 'Medhuziyaaraiy Magu, Malé, Maldives',
      city: 'Malé'
    },
    {
      place_id: 'maafushi_island',
      name: 'Maafushi Island',
      category: ['island', 'beach', 'tourist_attraction'],
      location: { lat: 3.9333, lng: 73.4333 },
      rating: 4.7,
      entry_fee: 0,
      tags: ['island', 'beach', 'snorkeling', 'diving', 'resort'],
      description: 'Popular local island with beautiful beaches, water sports, and guesthouses',
      address: 'Maafushi, Kaafu Atoll, Maldives',
      city: 'Maafushi'
    },
    {
      place_id: 'banana_reef',
      name: 'Banana Reef',
      category: ['diving', 'nature', 'tourist_attraction'],
      location: { lat: 4.3000, lng: 73.5500 },
      rating: 4.8,
      entry_fee: 50,
      tags: ['diving', 'snorkeling', 'marine_life', 'coral'],
      description: 'Famous diving spot with vibrant coral reefs and diverse marine life',
      address: 'North Malé Atoll, Maldives',
      city: 'North Malé Atoll'
    },
    {
      place_id: 'hp_reef',
      name: 'HP Reef',
      category: ['diving', 'nature', 'tourist_attraction'],
      location: { lat: 4.2500, lng: 73.5300 },
      rating: 4.7,
      entry_fee: 50,
      tags: ['diving', 'snorkeling', 'marine_life', 'adventure'],
      description: 'Excellent dive site known for sharks, rays, and colorful fish',
      address: 'North Malé Atoll, Maldives',
      city: 'North Malé Atoll'
    },
    {
      place_id: 'tsunami_monument',
      name: 'Tsunami Monument',
      category: ['monument', 'memorial', 'landmark'],
      location: { lat: 4.1750, lng: 73.5095 },
      rating: 4.0,
      entry_fee: 0,
      tags: ['memorial', 'history', 'monument'],
      description: 'Memorial commemorating the 2004 Indian Ocean tsunami',
      address: 'Boduthakurufaanu Magu, Malé, Maldives',
      city: 'Malé'
    },
    {
      place_id: 'seagull_cafe',
      name: 'Seagull Cafe House',
      category: ['restaurant', 'cafe'],
      location: { lat: 4.1755, lng: 73.5090 },
      rating: 4.3,
      entry_fee: 0,
      tags: ['cafe', 'local', 'breakfast', 'coffee'],
      description: 'Cozy cafe serving fresh coffee, pastries, and local breakfast',
      address: 'Chaandhanee Magu, Malé, Maldives',
      city: 'Malé'
    },
    {
      place_id: 'thai_wok',
      name: 'Thai Wok Restaurant',
      category: ['restaurant'],
      location: { lat: 4.1760, lng: 73.5088 },
      rating: 4.4,
      entry_fee: 0,
      tags: ['restaurant', 'thai', 'asian', 'dinner'],
      description: 'Restaurant serving authentic Thai cuisine and Asian fusion dishes',
      address: 'Orchid Magu, Malé, Maldives',
      city: 'Malé'
    },
    {
      place_id: 'symphony_restaurant',
      name: 'Symphony Restaurant',
      category: ['restaurant'],
      location: { lat: 4.1758, lng: 73.5092 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['restaurant', 'fine_dining', 'seafood', 'dinner'],
      description: 'Fine dining restaurant specializing in fresh seafood and Maldivian cuisine',
      address: 'Ameer Ahmed Magu, Malé, Maldives',
      city: 'Malé'
    },
    {
      place_id: 'shell_beans',
      name: 'Shell Beans',
      category: ['cafe', 'restaurant'],
      location: { lat: 4.1752, lng: 73.5094 },
      rating: 4.2,
      entry_fee: 0,
      tags: ['cafe', 'coffee', 'breakfast', 'lunch'],
      description: 'Popular cafe serving coffee, sandwiches, and light meals',
      address: 'Fareedhee Magu, Malé, Maldives',
      city: 'Malé'
    },
    {
      place_id: 'sala_thai',
      name: 'Sala Thai Restaurant',
      category: ['restaurant'],
      location: { lat: 4.1757, lng: 73.5091 },
      rating: 4.6,
      entry_fee: 0,
      tags: ['restaurant', 'thai', 'dinner', 'authentic'],
      description: 'Authentic Thai restaurant with traditional flavors and ambiance',
      address: 'Malé, Maldives',
      city: 'Malé'
    },
    {
      place_id: 'the_sea_house',
      name: 'The Sea House',
      category: ['restaurant'],
      location: { lat: 4.1754, lng: 73.5096 },
      rating: 4.7,
      entry_fee: 0,
      tags: ['restaurant', 'seafood', 'maldivian', 'dinner'],
      description: 'Waterfront restaurant serving fresh seafood and traditional Maldivian dishes',
      address: 'Marine Drive, Malé, Maldives',
      city: 'Malé'
    }
  ],
  
  // SOUTH AMERICA
  'rio de janeiro': [
    {
      place_id: 'christ_redeemer_rio',
      name: 'Christ the Redeemer',
      category: ['landmark', 'tourist_attraction', 'monument'],
      location: { lat: -22.9519, lng: -43.2105 },
      rating: 4.8,
      entry_fee: 25,
      tags: ['iconic', 'famous', 'must_see', 'religious', 'viewpoint'],
      description: 'Iconic Art Deco statue of Jesus Christ atop Corcovado mountain, one of the New Seven Wonders of the World.',
      address: 'Parque Nacional da Tijuca - Alto da Boa Vista, Rio de Janeiro'
    },
    {
      place_id: 'copacabana_beach_rio',
      name: 'Copacabana Beach',
      category: ['beach', 'nature', 'tourist_attraction'],
      location: { lat: -22.9711, lng: -43.1822 },
      rating: 4.3,
      entry_fee: 0,
      tags: ['beach', 'famous', 'carnival', 'iconic'],
      description: 'World-famous beach with golden sand, vibrant atmosphere, and stunning ocean views.',
      address: 'Av. Atlântica, Copacabana, Rio de Janeiro'
    },
    {
      place_id: 'sugarloaf_mountain_rio',
      name: 'Sugarloaf Mountain',
      category: ['mountain', 'viewpoint', 'tourist_attraction'],
      location: { lat: -22.9489, lng: -43.1575 },
      rating: 4.7,
      entry_fee: 35,
      tags: ['viewpoint', 'cable_car', 'nature', 'famous'],
      description: 'Iconic peak with cable car offering panoramic views of Rio, Guanabara Bay, and surrounding beaches.',
      address: 'Av. Pasteur, 520 - Urca, Rio de Janeiro'
    },
    {
      place_id: 'ipanema_beach_rio',
      name: 'Ipanema Beach',
      category: ['beach', 'nature', 'tourist_attraction'],
      location: { lat: -22.9838, lng: -43.2047 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['beach', 'famous', 'sunset', 'trendy'],
      description: 'Trendy beach known for beautiful sunsets, beach culture, and the famous "Girl from Ipanema" song.',
      address: 'Av. Vieira Souto, Ipanema, Rio de Janeiro'
    },
    {
      place_id: 'selaron_steps_rio',
      name: 'Escadaria Selarón (Selaron Steps)',
      category: ['art', 'landmark', 'tourist_attraction'],
      location: { lat: -22.9153, lng: -43.1790 },
      rating: 4.6,
      entry_fee: 0,
      tags: ['art', 'colorful', 'instagram', 'famous'],
      description: 'Vibrant mosaic staircase with over 2,000 colorful tiles from around the world, created by artist Jorge Selarón.',
      address: 'R. Joaquim Silva - Lapa, Rio de Janeiro'
    },
    {
      place_id: 'tijuca_forest_rio',
      name: 'Tijuca National Park',
      category: ['park', 'nature', 'hiking'],
      location: { lat: -22.9628, lng: -43.2839 },
      rating: 4.7,
      entry_fee: 0,
      tags: ['nature', 'rainforest', 'hiking', 'wildlife'],
      description: 'World\'s largest urban rainforest with hiking trails, waterfalls, and diverse wildlife.',
      address: 'Estrada da Cascatinha, 850 - Alto da Boa Vista, Rio de Janeiro'
    },
    {
      place_id: 'maracana_stadium_rio',
      name: 'Maracanã Stadium',
      category: ['stadium', 'sports', 'tourist_attraction'],
      location: { lat: -22.9122, lng: -43.2302 },
      rating: 4.4,
      entry_fee: 20,
      tags: ['football', 'sports', 'famous', 'historic'],
      description: 'Legendary football stadium, one of the largest in the world, home to historic World Cup matches.',
      address: 'Av. Pres. Castelo Branco, Maracanã, Rio de Janeiro'
    },
    {
      place_id: 'lapa_arches_rio',
      name: 'Lapa Arches (Arcos da Lapa)',
      category: ['landmark', 'historic', 'tourist_attraction'],
      location: { lat: -22.9133, lng: -43.1796 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['historic', 'architecture', 'nightlife', 'famous'],
      description: 'Historic 18th-century aqueduct turned into a symbol of Rio, surrounded by vibrant nightlife.',
      address: 'Lapa, Rio de Janeiro'
    },
    {
      place_id: 'botanical_garden_rio',
      name: 'Rio de Janeiro Botanical Garden',
      category: ['garden', 'nature', 'park'],
      location: { lat: -22.9669, lng: -43.2247 },
      rating: 4.6,
      entry_fee: 15,
      tags: ['nature', 'garden', 'peaceful', 'plants'],
      description: 'Beautiful botanical garden with over 6,500 species of plants, including rare orchids and giant water lilies.',
      address: 'R. Jardim Botânico, 1008 - Jardim Botânico, Rio de Janeiro'
    },
    {
      place_id: 'santa_teresa_rio',
      name: 'Santa Teresa Neighborhood',
      category: ['neighborhood', 'art', 'culture'],
      location: { lat: -22.9194, lng: -43.1897 },
      rating: 4.4,
      entry_fee: 0,
      tags: ['art', 'bohemian', 'culture', 'historic'],
      description: 'Charming bohemian neighborhood with colonial architecture, art studios, and panoramic city views.',
      address: 'Santa Teresa, Rio de Janeiro'
    },
    {
      place_id: 'confeitaria_colombo_rio',
      name: 'Confeitaria Colombo',
      category: ['restaurant', 'cafe', 'historic'],
      location: { lat: -22.9035, lng: -43.1765 },
      rating: 4.3,
      entry_fee: 0,
      tags: ['cafe', 'historic', 'pastries', 'elegant'],
      description: 'Historic Belle Époque café from 1894, famous for its elegant interior and traditional Brazilian pastries.',
      address: 'R. Gonçalves Dias, 32 - Centro, Rio de Janeiro'
    },
    {
      place_id: 'aprazivel_restaurant_rio',
      name: 'Aprazível Restaurant',
      category: ['restaurant', 'brazilian_cuisine'],
      location: { lat: -22.9194, lng: -43.1897 },
      rating: 4.6,
      entry_fee: 0,
      tags: ['restaurant', 'brazilian', 'views', 'upscale'],
      description: 'Upscale restaurant in Santa Teresa serving contemporary Brazilian cuisine with stunning city views.',
      address: 'R. Aprazível, 62 - Santa Teresa, Rio de Janeiro'
    },
    {
      place_id: 'porcao_rio_restaurant',
      name: 'Porcão Rio\'s',
      category: ['restaurant', 'steakhouse'],
      location: { lat: -22.9711, lng: -43.1822 },
      rating: 4.4,
      entry_fee: 0,
      tags: ['restaurant', 'steakhouse', 'brazilian', 'buffet'],
      description: 'Famous Brazilian steakhouse (churrascaria) with all-you-can-eat grilled meats and seafood buffet.',
      address: 'Av. Infante Dom Henrique, s/n - Aterro do Flamengo, Rio de Janeiro'
    },
    {
      place_id: 'bar_urca_rio',
      name: 'Bar Urca',
      category: ['restaurant', 'bar', 'seafood'],
      location: { lat: -22.9533, lng: -43.1644 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['bar', 'seafood', 'local', 'casual'],
      description: 'Traditional neighborhood bar famous for seafood snacks and cold beer with waterfront views.',
      address: 'R. Cândido Gaffrée, 205 - Urca, Rio de Janeiro'
    },
    {
      place_id: 'lagoa_rodrigo_freitas_rio',
      name: 'Rodrigo de Freitas Lagoon',
      category: ['lake', 'nature', 'park'],
      location: { lat: -22.9711, lng: -43.2047 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['nature', 'lake', 'jogging', 'cycling'],
      description: 'Scenic lagoon surrounded by mountains, perfect for jogging, cycling, and paddle boating.',
      address: 'Lagoa Rodrigo de Freitas, Rio de Janeiro'
    },
    {
      place_id: 'parque_lage_rio',
      name: 'Parque Lage',
      category: ['park', 'nature', 'art'],
      location: { lat: -22.9597, lng: -43.2114 },
      rating: 4.7,
      entry_fee: 0,
      tags: ['park', 'nature', 'art', 'cafe'],
      description: 'Beautiful public park with mansion, art school, hiking trails, and café with Christ the Redeemer views.',
      address: 'R. Jardim Botânico, 414 - Jardim Botânico, Rio de Janeiro'
    },
    {
      place_id: 'museum_tomorrow_rio',
      name: 'Museum of Tomorrow',
      category: ['museum', 'science', 'modern'],
      location: { lat: -22.8947, lng: -43.1803 },
      rating: 4.5,
      entry_fee: 20,
      tags: ['museum', 'science', 'modern', 'interactive'],
      description: 'Futuristic science museum exploring sustainability and the future of humanity with interactive exhibits.',
      address: 'Praça Mauá, 1 - Centro, Rio de Janeiro'
    },
    {
      place_id: 'sambadrome_rio',
      name: 'Sambadrome Marquês de Sapucaí',
      category: ['stadium', 'culture', 'carnival'],
      location: { lat: -22.9114, lng: -43.1961 },
      rating: 4.3,
      entry_fee: 15,
      tags: ['carnival', 'samba', 'culture', 'famous'],
      description: 'Purpose-built parade stadium where Rio\'s famous Carnival samba parade takes place every year.',
      address: 'R. Marquês de Sapucaí - Santo Cristo, Rio de Janeiro'
    },
    {
      place_id: 'arpoador_rock_rio',
      name: 'Arpoador Rock',
      category: ['viewpoint', 'nature', 'beach'],
      location: { lat: -22.9878, lng: -43.1906 },
      rating: 4.6,
      entry_fee: 0,
      tags: ['viewpoint', 'sunset', 'beach', 'surfing'],
      description: 'Rocky outcrop between Copacabana and Ipanema, famous for spectacular sunset views and surfing.',
      address: 'Arpoador, Rio de Janeiro'
    },
    {
      place_id: 'feira_hippie_ipanema_rio',
      name: 'Feira Hippie de Ipanema',
      category: ['market', 'shopping', 'art'],
      location: { lat: -22.9838, lng: -43.2047 },
      rating: 4.2,
      entry_fee: 0,
      tags: ['market', 'shopping', 'art', 'crafts'],
      description: 'Sunday arts and crafts market in Ipanema with local artisans selling jewelry, paintings, and souvenirs.',
      address: 'Praça General Osório - Ipanema, Rio de Janeiro'
    }
  ],

  // EUROPE
  'paris': [
    {
      place_id: 'eiffel_tower_paris',
      name: 'Eiffel Tower',
      category: ['landmark', 'tourist_attraction'],
      location: { lat: 48.8584, lng: 2.2945 },
      rating: 4.6,
      entry_fee: 29,
      tags: ['iconic', 'famous', 'must_see', 'architecture'],
      description: 'Iconic iron lattice tower and symbol of Paris, offering stunning city views.',
      address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
      opening_hours: { monday: '09:30-23:45', tuesday: '09:30-23:45', wednesday: '09:30-23:45', thursday: '09:30-23:45', friday: '09:30-23:45', saturday: '09:30-23:45', sunday: '09:30-23:45' },
      photos: ['https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400']
    },
    {
      place_id: 'louvre_museum_paris',
      name: 'Louvre Museum',
      category: ['museum', 'art_gallery'],
      location: { lat: 48.8606, lng: 2.3376 },
      rating: 4.7,
      entry_fee: 17,
      tags: ['art', 'culture', 'famous', 'mona_lisa'],
      description: 'World\'s largest art museum, home to the Mona Lisa and thousands of masterpieces.',
      address: 'Rue de Rivoli, 75001 Paris, France',
      opening_hours: { monday: 'closed', tuesday: '09:00-18:00', wednesday: '09:00-21:45', thursday: '09:00-18:00', friday: '09:00-21:45', saturday: '09:00-18:00', sunday: '09:00-18:00' }
    },
    {
      place_id: 'notre_dame_paris',
      name: 'Notre-Dame Cathedral',
      category: ['church', 'historical_site'],
      location: { lat: 48.8530, lng: 2.3499 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['gothic', 'architecture', 'historical', 'religious'],
      description: 'Medieval Catholic cathedral with stunning Gothic architecture and rich history.',
      address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris, France'
    },
    {
      place_id: 'champs_elysees_paris',
      name: 'Champs-Élysées',
      category: ['shopping', 'street'],
      location: { lat: 48.8698, lng: 2.3076 },
      rating: 4.2,
      entry_fee: 0,
      tags: ['shopping', 'famous', 'avenue', 'luxury'],
      description: 'Famous avenue known for shopping, cafes, and the Arc de Triomphe.',
      address: 'Champs-Élysées, 75008 Paris, France'
    }
  ],

  'switzerland': [
    {
      place_id: 'matterhorn_switzerland',
      name: 'Matterhorn',
      category: ['mountain', 'landmark', 'tourist_attraction'],
      location: { lat: 45.9763, lng: 7.6586 },
      rating: 4.9,
      entry_fee: 0,
      tags: ['iconic', 'mountain', 'skiing', 'nature', 'famous'],
      description: 'Iconic pyramid-shaped mountain on the Swiss-Italian border, one of the highest peaks in the Alps.',
      address: 'Zermatt, Switzerland'
    },
    {
      place_id: 'jungfraujoch_switzerland',
      name: 'Jungfraujoch - Top of Europe',
      category: ['viewpoint', 'tourist_attraction'],
      location: { lat: 46.5475, lng: 7.9858 },
      rating: 4.7,
      entry_fee: 120,
      tags: ['mountain', 'views', 'glacier', 'famous', 'railway'],
      description: 'Highest railway station in Europe at 3,454m, offering breathtaking views of the Aletsch Glacier.',
      address: 'Jungfraujoch, 3801 Kleine Scheidegg, Switzerland'
    },
    {
      place_id: 'chapel_bridge_lucerne',
      name: 'Chapel Bridge (Kapellbrücke)',
      category: ['bridge', 'landmark', 'tourist_attraction'],
      location: { lat: 47.0517, lng: 8.3074 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['historic', 'bridge', 'medieval', 'famous', 'lucerne'],
      description: 'Iconic wooden covered bridge from 1333, the oldest in Europe, with beautiful paintings.',
      address: 'Kapellbrücke, 6002 Luzern, Switzerland'
    },
    {
      place_id: 'lake_geneva_switzerland',
      name: 'Lake Geneva',
      category: ['lake', 'nature', 'tourist_attraction'],
      location: { lat: 46.4527, lng: 6.5298 },
      rating: 4.6,
      entry_fee: 0,
      tags: ['lake', 'nature', 'scenic', 'boat_tours', 'famous'],
      description: 'Stunning crescent-shaped lake surrounded by Alps, perfect for boat cruises and lakeside walks.',
      address: 'Lake Geneva, Switzerland/France'
    },
    {
      place_id: 'rhine_falls_switzerland',
      name: 'Rhine Falls',
      category: ['waterfall', 'nature', 'tourist_attraction'],
      location: { lat: 47.6779, lng: 8.6156 },
      rating: 4.6,
      entry_fee: 5,
      tags: ['waterfall', 'nature', 'scenic', 'famous', 'largest'],
      description: 'Largest waterfall in Europe by volume, spectacular views from viewing platforms and boat tours.',
      address: 'Rheinfallquai, 8212 Neuhausen am Rheinfall, Switzerland'
    },
    {
      place_id: 'old_town_bern',
      name: 'Old Town of Bern',
      category: ['neighborhood', 'historic', 'tourist_attraction'],
      location: { lat: 46.9480, lng: 7.4474 },
      rating: 4.7,
      entry_fee: 0,
      tags: ['unesco', 'historic', 'medieval', 'architecture', 'famous'],
      description: 'UNESCO World Heritage medieval old town with arcades, fountains, and the famous Zytglogge clock tower.',
      address: 'Altstadt, 3011 Bern, Switzerland'
    },
    {
      place_id: 'chillon_castle',
      name: 'Chillon Castle',
      category: ['castle', 'historic', 'tourist_attraction'],
      location: { lat: 46.4143, lng: 6.9275 },
      rating: 4.5,
      entry_fee: 14,
      tags: ['castle', 'historic', 'medieval', 'lake', 'famous'],
      description: 'Medieval castle on Lake Geneva, one of the most visited historic buildings in Switzerland.',
      address: 'Avenue de Chillon 21, 1820 Veytaux, Switzerland'
    },
    {
      place_id: 'swiss_national_museum',
      name: 'Swiss National Museum',
      category: ['museum', 'culture'],
      location: { lat: 47.3788, lng: 8.5403 },
      rating: 4.4,
      entry_fee: 10,
      tags: ['museum', 'culture', 'history', 'swiss', 'zurich'],
      description: 'Largest museum of cultural history in Switzerland, showcasing Swiss heritage and artifacts.',
      address: 'Museumstrasse 2, 8001 Zürich, Switzerland'
    },
    {
      place_id: 'bahnhofstrasse_zurich',
      name: 'Bahnhofstrasse',
      category: ['shopping', 'street'],
      location: { lat: 47.3769, lng: 8.5417 },
      rating: 4.3,
      entry_fee: 0,
      tags: ['shopping', 'luxury', 'famous', 'zurich', 'street'],
      description: 'One of the world\'s most exclusive shopping streets, lined with luxury boutiques and cafes.',
      address: 'Bahnhofstrasse, 8001 Zürich, Switzerland'
    },
    {
      place_id: 'interlaken_switzerland',
      name: 'Interlaken',
      category: ['town', 'tourist_attraction', 'adventure'],
      location: { lat: 46.6863, lng: 7.8632 },
      rating: 4.7,
      entry_fee: 0,
      tags: ['adventure', 'nature', 'skiing', 'paragliding', 'famous'],
      description: 'Adventure capital of Switzerland, nestled between two lakes with stunning mountain views.',
      address: 'Interlaken, Switzerland'
    }
  ],

  'london': [
    {
      place_id: 'big_ben_london',
      name: 'Big Ben',
      category: ['landmark', 'tourist_attraction'],
      location: { lat: 51.4994, lng: -0.1245 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['iconic', 'famous', 'clock_tower', 'parliament'],
      description: 'Iconic clock tower and symbol of London, part of the Palace of Westminster.',
      address: 'Westminster, London SW1A 0AA, UK'
    },
    {
      place_id: 'tower_bridge_london',
      name: 'Tower Bridge',
      category: ['bridge', 'tourist_attraction'],
      location: { lat: 51.5055, lng: -0.0754 },
      rating: 4.4,
      entry_fee: 12,
      tags: ['iconic', 'bridge', 'victorian', 'thames'],
      description: 'Victorian bascule bridge with glass walkways offering panoramic views.',
      address: 'Tower Bridge Rd, London SE1 2UP, UK'
    },
    {
      place_id: 'british_museum_london',
      name: 'British Museum',
      category: ['museum'],
      location: { lat: 51.5194, lng: -0.1270 },
      rating: 4.7,
      entry_fee: 0,
      tags: ['museum', 'history', 'culture', 'free'],
      description: 'World-renowned museum with vast collection of art and artifacts from around the globe.',
      address: 'Great Russell St, Bloomsbury, London WC1B 3DG, UK'
    },
    {
      place_id: 'buckingham_palace_london',
      name: 'Buckingham Palace',
      category: ['palace', 'tourist_attraction'],
      location: { lat: 51.5014, lng: -0.1419 },
      rating: 4.3,
      entry_fee: 30,
      tags: ['royal', 'palace', 'changing_guard', 'monarchy'],
      description: 'Official residence of the British monarch with state rooms and royal gardens.',
      address: 'Westminster, London SW1A 1AA, UK'
    }
  ],

  'rome': [
    {
      place_id: 'colosseum_rome',
      name: 'Colosseum',
      category: ['historical_site', 'tourist_attraction'],
      location: { lat: 41.8902, lng: 12.4922 },
      rating: 4.6,
      entry_fee: 16,
      tags: ['ancient', 'gladiators', 'amphitheater', 'unesco'],
      description: 'Ancient Roman amphitheater, iconic symbol of Imperial Rome and gladiatorial contests.',
      address: 'Piazza del Colosseo, 1, 00184 Roma RM, Italy'
    },
    {
      place_id: 'vatican_city_rome',
      name: 'Vatican Museums',
      category: ['museum', 'religious'],
      location: { lat: 41.9065, lng: 12.4536 },
      rating: 4.5,
      entry_fee: 20,
      tags: ['sistine_chapel', 'michelangelo', 'papal', 'art'],
      description: 'Papal museums housing Renaissance masterpieces including the Sistine Chapel.',
      address: '00120 Vatican City'
    },
    {
      place_id: 'trevi_fountain_rome',
      name: 'Trevi Fountain',
      category: ['fountain', 'tourist_attraction'],
      location: { lat: 41.9009, lng: 12.4833 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['baroque', 'fountain', 'wishes', 'romantic'],
      description: 'Baroque fountain where tradition says throwing a coin ensures return to Rome.',
      address: 'Piazza di Trevi, 00187 Roma RM, Italy'
    }
  ],

  // ASIA
  'tokyo': [
    {
      place_id: 'senso_ji_tokyo',
      name: 'Sensō-ji Temple',
      category: ['temple', 'religious'],
      location: { lat: 35.7148, lng: 139.7967 },
      rating: 4.3,
      entry_fee: 0,
      tags: ['buddhist', 'ancient', 'asakusa', 'traditional'],
      description: 'Ancient Buddhist temple in Asakusa, Tokyo\'s oldest temple with traditional atmosphere.',
      address: '2 Chome-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan'
    },
    {
      place_id: 'tokyo_skytree',
      name: 'Tokyo Skytree',
      category: ['tower', 'observation_deck'],
      location: { lat: 35.7101, lng: 139.8107 },
      rating: 4.1,
      entry_fee: 25,
      tags: ['modern', 'views', 'broadcasting', 'tall'],
      description: 'World\'s second tallest structure offering panoramic views of Tokyo.',
      address: '1 Chome-1-2 Oshiage, Sumida City, Tokyo 131-0045, Japan'
    },
    {
      place_id: 'shibuya_crossing_tokyo',
      name: 'Shibuya Crossing',
      category: ['street', 'tourist_attraction'],
      location: { lat: 35.6598, lng: 139.7006 },
      rating: 4.2,
      entry_fee: 0,
      tags: ['busy', 'iconic', 'modern', 'urban'],
      description: 'World\'s busiest pedestrian crossing, iconic symbol of modern Tokyo.',
      address: 'Shibuya City, Tokyo, Japan'
    }
  ],

  'kyoto': [
    {
      place_id: 'fushimi_inari_kyoto',
      name: 'Fushimi Inari Shrine',
      category: ['shrine', 'religious'],
      location: { lat: 34.9671, lng: 135.7727 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['torii_gates', 'mountain', 'hiking', 'spiritual'],
      description: 'Famous shrine with thousands of vermillion torii gates leading up the mountain.',
      address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto, 612-0882, Japan'
    },
    {
      place_id: 'kinkaku_ji_kyoto',
      name: 'Kinkaku-ji (Golden Pavilion)',
      category: ['temple', 'garden'],
      location: { lat: 35.0394, lng: 135.7292 },
      rating: 4.4,
      entry_fee: 5,
      tags: ['golden', 'zen', 'garden', 'unesco'],
      description: 'Stunning golden temple reflected in surrounding pond, UNESCO World Heritage site.',
      address: '1 Kinkakujicho, Kita Ward, Kyoto, 603-8361, Japan'
    }
  ],

  // AMERICAS
  'new york': [
    {
      place_id: 'statue_liberty_ny',
      name: 'Statue of Liberty',
      category: ['monument', 'tourist_attraction'],
      location: { lat: 40.6892, lng: -74.0445 },
      rating: 4.6,
      entry_fee: 23,
      tags: ['freedom', 'iconic', 'ferry', 'symbol'],
      description: 'Iconic symbol of freedom and democracy, gift from France to America.',
      address: 'New York, NY 10004, USA'
    },
    {
      place_id: 'central_park_ny',
      name: 'Central Park',
      category: ['park'],
      location: { lat: 40.7829, lng: -73.9654 },
      rating: 4.7,
      entry_fee: 0,
      tags: ['park', 'nature', 'urban_oasis', 'free'],
      description: 'Massive urban park in Manhattan offering green space, lakes, and recreational activities.',
      address: 'New York, NY, USA'
    },
    {
      place_id: 'times_square_ny',
      name: 'Times Square',
      category: ['square', 'entertainment'],
      location: { lat: 40.7580, lng: -73.9855 },
      rating: 4.3,
      entry_fee: 0,
      tags: ['bright_lights', 'broadway', 'shopping', 'bustling'],
      description: 'Bright commercial intersection known as "The Crossroads of the World".',
      address: 'Manhattan, NY 10036, USA'
    },
    {
      place_id: 'empire_state_building_ny',
      name: 'Empire State Building',
      category: ['skyscraper', 'observation_deck'],
      location: { lat: 40.7484, lng: -73.9857 },
      rating: 4.4,
      entry_fee: 44,
      tags: ['art_deco', 'views', 'iconic', 'skyscraper'],
      description: 'Art Deco skyscraper with observation decks offering spectacular city views.',
      address: '20 W 34th St, New York, NY 10001, USA'
    }
  ],

  'los angeles': [
    {
      place_id: 'hollywood_sign_la',
      name: 'Hollywood Sign',
      category: ['landmark', 'tourist_attraction'],
      location: { lat: 34.1341, lng: -118.3215 },
      rating: 4.2,
      entry_fee: 0,
      tags: ['iconic', 'movies', 'hollywood', 'views'],
      description: 'Iconic sign overlooking Los Angeles, symbol of the entertainment industry.',
      address: 'Los Angeles, CA 90068, USA'
    },
    {
      place_id: 'santa_monica_pier_la',
      name: 'Santa Monica Pier',
      category: ['pier', 'amusement_park'],
      location: { lat: 34.0089, lng: -118.4973 },
      rating: 4.3,
      entry_fee: 0,
      tags: ['beach', 'amusement', 'ferris_wheel', 'ocean'],
      description: 'Historic pier with amusement park, restaurants, and beautiful Pacific Ocean views.',
      address: '200 Santa Monica Pier, Santa Monica, CA 90401, USA'
    }
  ],

  'vietnam': [
    {
      place_id: 'halong_bay_vietnam',
      name: 'Ha Long Bay',
      category: ['bay', 'nature', 'unesco', 'tourist_attraction'],
      location: { lat: 20.9101, lng: 107.1839 },
      rating: 4.8,
      entry_fee: 25,
      tags: ['unesco', 'nature', 'cruise', 'limestone', 'famous'],
      description: 'UNESCO World Heritage Site with thousands of limestone islands and emerald waters, perfect for overnight cruises.',
      address: 'Quang Ninh Province, Vietnam'
    },
    {
      place_id: 'hoan_kiem_lake_hanoi',
      name: 'Hoan Kiem Lake',
      category: ['lake', 'park', 'tourist_attraction'],
      location: { lat: 21.0285, lng: 105.8542 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['lake', 'historic', 'hanoi', 'free', 'famous'],
      description: 'Historic lake in the heart of Hanoi with Ngoc Son Temple and the iconic red bridge.',
      address: 'Hoan Kiem District, Hanoi, Vietnam'
    },
    {
      place_id: 'imperial_city_hue',
      name: 'Imperial City of Hue',
      category: ['palace', 'historic', 'unesco', 'tourist_attraction'],
      location: { lat: 16.4637, lng: 107.5909 },
      rating: 4.6,
      entry_fee: 7,
      tags: ['unesco', 'palace', 'historic', 'imperial', 'famous'],
      description: 'Former imperial capital with stunning palaces, temples, and walls from the Nguyen Dynasty.',
      address: 'Hue City, Thua Thien Hue Province, Vietnam'
    },
    {
      place_id: 'hoi_an_ancient_town',
      name: 'Hoi An Ancient Town',
      category: ['town', 'historic', 'unesco', 'tourist_attraction'],
      location: { lat: 15.8801, lng: 108.3380 },
      rating: 4.7,
      entry_fee: 5,
      tags: ['unesco', 'historic', 'lanterns', 'charming', 'famous'],
      description: 'Beautifully preserved ancient trading port with colorful lanterns, tailor shops, and riverside cafes.',
      address: 'Hoi An, Quang Nam Province, Vietnam'
    },
    {
      place_id: 'cu_chi_tunnels',
      name: 'Cu Chi Tunnels',
      category: ['historic', 'war_memorial', 'tourist_attraction'],
      location: { lat: 11.1510, lng: 106.4630 },
      rating: 4.4,
      entry_fee: 5,
      tags: ['historic', 'war', 'tunnels', 'educational', 'famous'],
      description: 'Extensive underground tunnel network used during the Vietnam War, now a fascinating historical site.',
      address: 'Cu Chi District, Ho Chi Minh City, Vietnam'
    },
    {
      place_id: 'mekong_delta',
      name: 'Mekong Delta',
      category: ['river', 'nature', 'tourist_attraction'],
      location: { lat: 10.0452, lng: 105.7469 },
      rating: 4.6,
      entry_fee: 15,
      tags: ['river', 'nature', 'floating_market', 'boat_tour', 'famous'],
      description: 'Vast river delta with floating markets, fruit orchards, and traditional villages accessible by boat.',
      address: 'Mekong Delta Region, Southern Vietnam'
    },
    {
      place_id: 'ben_thanh_market_hcmc',
      name: 'Ben Thanh Market',
      category: ['market', 'shopping', 'tourist_attraction'],
      location: { lat: 10.7720, lng: 106.6981 },
      rating: 4.2,
      entry_fee: 0,
      tags: ['market', 'shopping', 'food', 'local', 'famous'],
      description: 'Iconic central market in Ho Chi Minh City offering local food, souvenirs, and Vietnamese culture.',
      address: 'District 1, Ho Chi Minh City, Vietnam'
    },
    {
      place_id: 'war_remnants_museum',
      name: 'War Remnants Museum',
      category: ['museum', 'historic', 'tourist_attraction'],
      location: { lat: 10.7797, lng: 106.6918 },
      rating: 4.5,
      entry_fee: 2,
      tags: ['museum', 'war', 'historic', 'educational', 'famous'],
      description: 'Powerful museum documenting the Vietnam War with photographs, military equipment, and historical artifacts.',
      address: '28 Vo Van Tan, District 3, Ho Chi Minh City, Vietnam'
    },
    {
      place_id: 'sapa_rice_terraces',
      name: 'Sapa Rice Terraces',
      category: ['nature', 'scenic', 'tourist_attraction'],
      location: { lat: 22.3364, lng: 103.8438 },
      rating: 4.8,
      entry_fee: 0,
      tags: ['nature', 'scenic', 'trekking', 'ethnic_villages', 'famous'],
      description: 'Stunning terraced rice fields in the mountains with ethnic minority villages and trekking opportunities.',
      address: 'Sapa, Lao Cai Province, Vietnam'
    },
    {
      place_id: 'phong_nha_ke_bang',
      name: 'Phong Nha-Ke Bang National Park',
      category: ['nature', 'unesco', 'caves', 'tourist_attraction'],
      location: { lat: 17.5833, lng: 106.2833 },
      rating: 4.9,
      entry_fee: 10,
      tags: ['unesco', 'caves', 'nature', 'adventure', 'famous'],
      description: 'UNESCO site with the world\'s largest cave (Son Doong) and spectacular limestone karst landscapes.',
      address: 'Quang Binh Province, Vietnam'
    }
  ],

  // MIDDLE EAST & AFRICA
  'dubai': [
    {
      place_id: 'burj_khalifa_dubai',
      name: 'Burj Khalifa',
      category: ['skyscraper', 'observation_deck'],
      location: { lat: 25.1972, lng: 55.2744 },
      rating: 4.6,
      entry_fee: 40,
      tags: ['tallest_building', 'modern', 'luxury', 'views'],
      description: 'World\'s tallest building with observation decks offering breathtaking views.',
      address: '1 Sheikh Mohammed bin Rashid Blvd, Dubai, UAE'
    },
    {
      place_id: 'dubai_mall',
      name: 'Dubai Mall',
      category: ['shopping_mall'],
      location: { lat: 25.1975, lng: 55.2796 },
      rating: 4.5,
      entry_fee: 0,
      tags: ['shopping', 'luxury', 'aquarium', 'entertainment'],
      description: 'One of the world\'s largest shopping malls with aquarium and entertainment.',
      address: '1 Sheikh Mohammed bin Rashid Blvd, Dubai, UAE'
    }
  ],

  'cairo': [
    {
      place_id: 'pyramids_giza_cairo',
      name: 'Pyramids of Giza',
      category: ['historical_site', 'wonder'],
      location: { lat: 29.9792, lng: 31.1342 },
      rating: 4.5,
      entry_fee: 15,
      tags: ['ancient', 'pharaohs', 'wonder_of_world', 'unesco'],
      description: 'Ancient pyramids and the Great Sphinx, last surviving Wonder of the Ancient World.',
      address: 'Al Haram, Nazlet El-Semman, Al Giza Desert, Giza Governorate, Egypt'
    }
  ],

  // OCEANIA
  'sydney': [
    {
      place_id: 'sydney_opera_house',
      name: 'Sydney Opera House',
      category: ['performing_arts', 'landmark'],
      location: { lat: -33.8568, lng: 151.2153 },
      rating: 4.5,
      entry_fee: 43,
      tags: ['iconic', 'architecture', 'unesco', 'performing_arts'],
      description: 'Iconic performing arts venue with distinctive shell-like design.',
      address: 'Bennelong Point, Sydney NSW 2000, Australia'
    },
    {
      place_id: 'harbour_bridge_sydney',
      name: 'Sydney Harbour Bridge',
      category: ['bridge', 'tourist_attraction'],
      location: { lat: -33.8523, lng: 151.2108 },
      rating: 4.6,
      entry_fee: 0,
      tags: ['bridge', 'climbing', 'views', 'iconic'],
      description: 'Steel arch bridge offering bridge climbing experiences and harbor views.',
      address: 'Sydney Harbour Bridge, Sydney NSW, Australia'
    }
  ],

  // SOUTH AMERICA
  'rio de janeiro': [
    {
      place_id: 'christ_redeemer_rio',
      name: 'Christ the Redeemer',
      category: ['statue', 'religious'],
      location: { lat: -22.9519, lng: -43.2105 },
      rating: 4.5,
      entry_fee: 25,
      tags: ['iconic', 'statue', 'corcovado', 'wonder_of_world'],
      description: 'Iconic Art Deco statue of Jesus Christ atop Corcovado mountain.',
      address: 'Parque Nacional da Tijuca - Alto da Boa Vista, Rio de Janeiro - RJ, Brazil'
    },
    {
      place_id: 'copacabana_beach_rio',
      name: 'Copacabana Beach',
      category: ['beach'],
      location: { lat: -22.9711, lng: -43.1822 },
      rating: 4.3,
      entry_fee: 0,
      tags: ['beach', 'famous', 'carnival', 'nightlife'],
      description: 'World-famous beach known for its vibrant atmosphere and New Year celebrations.',
      address: 'Copacabana, Rio de Janeiro - RJ, Brazil'
    }
  ],

  // INDIA
  'delhi': [
    {
      place_id: 'red_fort_delhi',
      name: 'Red Fort',
      category: ['fort', 'historical_site'],
      location: { lat: 28.6562, lng: 77.2410 },
      rating: 4.3,
      entry_fee: 2,
      tags: ['mughal', 'unesco', 'historical', 'architecture'],
      description: 'Historic Mughal fort complex, UNESCO World Heritage site and symbol of India.',
      address: 'Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi, Delhi 110006, India'
    },
    {
      place_id: 'india_gate_delhi',
      name: 'India Gate',
      category: ['monument', 'memorial'],
      location: { lat: 28.6129, lng: 77.2295 },
      rating: 4.4,
      entry_fee: 0,
      tags: ['war_memorial', 'british_raj', 'iconic', 'free'],
      description: 'War memorial arch commemorating soldiers who died in World War I.',
      address: 'Rajpath, India Gate, New Delhi, Delhi 110001, India'
    }
  ],

  'mumbai': [
    {
      place_id: 'gateway_india_mumbai',
      name: 'Gateway of India',
      category: ['monument', 'tourist_attraction'],
      location: { lat: 18.9220, lng: 72.8347 },
      rating: 4.2,
      entry_fee: 0,
      tags: ['colonial', 'harbor', 'iconic', 'historical'],
      description: 'Historic monument overlooking Mumbai Harbor, built during British colonial period.',
      address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001, India'
    }
  ],

  'vadodara': [
    { place_id: 'laxmi_vilas_palace', name: 'Laxmi Vilas Palace', category: ['palace', 'museum', 'tourist_attraction'], location: { lat: 22.2973, lng: 73.1942 }, rating: 4.6, entry_fee: 150, tags: ['royal', 'architecture', 'heritage', 'museum'], description: 'Magnificent royal palace, four times the size of Buckingham Palace, with stunning Indo-Saracenic architecture.' },
    { place_id: 'sayaji_baug', name: 'Sayaji Baug', category: ['park', 'garden', 'zoo'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.3, entry_fee: 0, tags: ['nature', 'family', 'zoo', 'garden'], description: 'Largest garden in Western India with zoo, museum, planetarium, and toy train.' },
    { place_id: 'emechanics_museum', name: 'Baroda Museum & Picture Gallery', category: ['museum', 'art_gallery'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.4, entry_fee: 20, tags: ['art', 'culture', 'history', 'museum'], description: 'Premier museum with Egyptian mummy, Mughal miniatures, and European paintings.' },
    { place_id: 'kirti_mandir', name: 'Kirti Mandir', category: ['memorial', 'tourist_attraction'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.2, entry_fee: 0, tags: ['historical', 'memorial', 'architecture'], description: 'Memorial dedicated to the Gaekwad dynasty, birthplace of Maharaja Sayajirao III.' },
    { place_id: 'champaner_pavagadh', name: 'Champaner-Pavagadh Archaeological Park', category: ['unesco', 'historical_site', 'fort'], location: { lat: 22.4833, lng: 73.5333 }, rating: 4.5, entry_fee: 25, tags: ['unesco', 'heritage', 'fort', 'historical'], description: 'UNESCO World Heritage Site with ancient forts, palaces, and mosques.' },
    { place_id: 'sursagar_lake', name: 'Sursagar Lake', category: ['lake', 'landmark'], location: { lat: 22.2973, lng: 73.1942 }, rating: 4.1, entry_fee: 0, tags: ['scenic', 'lake', 'shiva_statue', 'evening'], description: 'Circular lake in city center with 120-foot tall Shiva statue in the middle.' },
    { place_id: 'emechanics_planetarium', name: 'Sayaji Baug Planetarium', category: ['planetarium', 'science'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.2, entry_fee: 30, tags: ['science', 'education', 'family', 'astronomy'], description: 'Modern planetarium with astronomy shows and science exhibits.' },
    { place_id: 'makarpura_palace', name: 'Makarpura Palace', category: ['palace', 'landmark'], location: { lat: 22.2667, lng: 73.1833 }, rating: 4.0, entry_fee: 0, tags: ['palace', 'architecture', 'heritage'], description: 'Italian-style palace, now an Indian Air Force training establishment.' },
    { place_id: 'nazarbaug_palace', name: 'Nazarbaug Palace', category: ['palace', 'museum'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.1, entry_fee: 50, tags: ['royal', 'heritage', 'museum'], description: 'Former royal residence with museum displaying royal artifacts and memorabilia.' },
    { place_id: 'emechanics_zoo', name: 'Kamati Baug Zoo', category: ['zoo', 'park'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.2, entry_fee: 20, tags: ['animals', 'family', 'nature'], description: 'Well-maintained zoo with diverse animal species and reptile house.' },
    { place_id: 'mandvi_gate', name: 'Mandvi Gate', category: ['landmark', 'historical_site'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.0, entry_fee: 0, tags: ['historical', 'architecture', 'gate'], description: 'Historic city gate from the old walled city of Vadodara.' },
    { place_id: 'khanderao_market', name: 'Khanderao Market', category: ['market', 'shopping'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.1, entry_fee: 0, tags: ['shopping', 'local', 'market', 'food'], description: 'Vibrant local market for vegetables, fruits, and traditional items.' },
    { place_id: 'emechanics_health_museum', name: 'Health Museum', category: ['museum', 'science'], location: { lat: 22.3072, lng: 73.1812 }, rating: 3.9, entry_fee: 10, tags: ['science', 'education', 'health'], description: 'Unique museum dedicated to health education and awareness.' },
    { place_id: 'ajwa_water_park', name: 'Ajwa Water Park', category: ['water_park', 'entertainment'], location: { lat: 22.3500, lng: 73.1500 }, rating: 4.3, entry_fee: 300, tags: ['fun', 'family', 'water', 'adventure'], description: 'Popular water park with slides, wave pool, and rain dance.' },
    { place_id: 'emechanics_railway_museum', name: 'Railway Museum', category: ['museum', 'railway'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.0, entry_fee: 20, tags: ['railway', 'history', 'museum'], description: 'Museum showcasing vintage locomotives and railway heritage.' },
    { place_id: 'nyay_mandir', name: 'Nyay Mandir', category: ['court', 'landmark'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.2, entry_fee: 0, tags: ['architecture', 'historical', 'court'], description: 'Impressive court building with Indo-Saracenic architecture.' },
    { place_id: 'emechanics_picture_gallery', name: 'Maharaja Fateh Singh Museum', category: ['museum', 'art_gallery'], location: { lat: 22.2973, lng: 73.1942 }, rating: 4.4, entry_fee: 50, tags: ['art', 'royal', 'paintings', 'sculpture'], description: 'Art gallery with European paintings, sculptures, and royal collections.' },
    { place_id: 'aurobindo_ashram', name: 'Aurobindo Ashram', category: ['ashram', 'spiritual'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.3, entry_fee: 0, tags: ['spiritual', 'peaceful', 'meditation'], description: 'Peaceful ashram for meditation and spiritual practices.' },
    { place_id: 'emechanics_toy_train', name: 'Sayaji Baug Toy Train', category: ['entertainment', 'park'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.2, entry_fee: 20, tags: ['family', 'fun', 'kids'], description: 'Charming toy train ride through Sayaji Baug garden.' },
    { place_id: 'sur_sadan', name: 'Sur Sadan', category: ['cultural_center', 'music'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.1, entry_fee: 0, tags: ['music', 'culture', 'performance'], description: 'Cultural center for classical music and performing arts.' },
    { place_id: 'cafe_baroda', name: 'Cafe Baroda', category: ['cafe', 'restaurant'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.4, entry_fee: 0, tags: ['food', 'cafe', 'coffee'], description: 'Popular cafe with great coffee and continental food.' },
    { place_id: 'mandap_restaurant', name: 'Mandap Restaurant', category: ['restaurant', 'food'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.3, entry_fee: 0, tags: ['gujarati', 'thali', 'food'], description: 'Authentic Gujarati thali restaurant with traditional flavors.' },
    { place_id: 'das_khaman', name: 'Das Khaman House', category: ['restaurant', 'food'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.5, entry_fee: 0, tags: ['snacks', 'khaman', 'local', 'famous'], description: 'Famous for authentic Gujarati snacks, especially khaman.' },
    { place_id: 'canara_coffee', name: 'Canara Coffee House', category: ['cafe', 'restaurant'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.2, entry_fee: 0, tags: ['coffee', 'snacks', 'local'], description: 'Iconic coffee house serving South Indian snacks and filter coffee.' },
    { place_id: 'alkapuri_garden', name: 'Alkapuri Garden', category: ['park', 'garden'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.0, entry_fee: 0, tags: ['nature', 'peaceful', 'garden'], description: 'Serene garden perfect for morning walks and relaxation.' },
    { place_id: 'inorbit_mall', name: 'Inorbit Mall', category: ['shopping_mall', 'shopping'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.3, entry_fee: 0, tags: ['shopping', 'food', 'entertainment'], description: 'Modern shopping mall with brands, food court, and cinema.' },
    { place_id: 'vadodara_central', name: 'Vadodara Central Mall', category: ['shopping_mall', 'shopping'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.2, entry_fee: 0, tags: ['shopping', 'brands', 'food'], description: 'Popular mall with retail stores and dining options.' },
    { place_id: 'emechanics_golf_club', name: 'Gaekwad Baroda Golf Club', category: ['golf', 'sports'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.4, entry_fee: 500, tags: ['golf', 'sports', 'luxury'], description: 'Premier golf club with 18-hole championship course.' },
    { place_id: 'ajwa_garden', name: 'Ajwa Garden', category: ['garden', 'park'], location: { lat: 22.3500, lng: 73.1500 }, rating: 4.2, entry_fee: 20, tags: ['nature', 'garden', 'family'], description: 'Beautiful garden with musical fountain and boating.' },
    { place_id: 'emechanics_science_center', name: 'Science Center', category: ['science', 'museum'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.1, entry_fee: 30, tags: ['science', 'education', 'interactive'], description: 'Interactive science museum with hands-on exhibits.' },
    { place_id: 'havmor_restaurant', name: 'Havmor Restaurant', category: ['restaurant', 'food'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.4, entry_fee: 0, tags: ['ice_cream', 'food', 'family'], description: 'Famous for ice creams and multi-cuisine food.' },
    { place_id: 'vishwamitri_river', name: 'Vishwamitri River', category: ['river', 'nature'], location: { lat: 22.3072, lng: 73.1812 }, rating: 3.8, entry_fee: 0, tags: ['nature', 'river', 'crocodiles'], description: 'River flowing through city, known for urban crocodile population.' },
    { place_id: 'emechanics_cultural_center', name: 'Shri Sayaji Vaibhav', category: ['cultural_center', 'museum'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.2, entry_fee: 30, tags: ['culture', 'history', 'heritage'], description: 'Cultural center showcasing Vadodara\'s rich heritage.' },
    { place_id: 'pratap_vilas_palace', name: 'Pratap Vilas Palace', category: ['palace', 'landmark'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.0, entry_fee: 0, tags: ['palace', 'architecture'], description: 'Historic palace with beautiful architecture.' },
    { place_id: 'emechanics_aquarium', name: 'Sayaji Baug Aquarium', category: ['aquarium', 'entertainment'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.0, entry_fee: 20, tags: ['fish', 'family', 'aquatic'], description: 'Aquarium with diverse marine and freshwater species.' },
    { place_id: 'kalabhavan', name: 'Kalabhavan', category: ['cultural_center', 'art'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.1, entry_fee: 0, tags: ['art', 'culture', 'performance'], description: 'Art and cultural center for exhibitions and performances.' },
    { place_id: 'emechanics_bird_aviary', name: 'Bird Aviary', category: ['zoo', 'park'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.0, entry_fee: 10, tags: ['birds', 'nature', 'family'], description: 'Aviary with colorful bird species from around the world.' },
    { place_id: 'baps_temple', name: 'BAPS Swaminarayan Temple', category: ['temple', 'religious'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.5, entry_fee: 0, tags: ['temple', 'spiritual', 'architecture'], description: 'Beautiful temple with intricate carvings and peaceful atmosphere.' },
    { place_id: 'emechanics_rose_garden', name: 'Rose Garden', category: ['garden', 'park'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.1, entry_fee: 0, tags: ['flowers', 'nature', 'romantic'], description: 'Garden with hundreds of rose varieties and walking paths.' },
    { place_id: 'sardar_patel_planetarium', name: 'Sardar Patel Planetarium', category: ['planetarium', 'science'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.2, entry_fee: 30, tags: ['astronomy', 'science', 'education'], description: 'Planetarium with astronomy shows and sky observation.' },
    { place_id: 'hot_stuff_restaurant', name: 'Hot Stuff Restaurant', category: ['restaurant', 'food'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.3, entry_fee: 0, tags: ['chinese', 'food', 'popular'], description: 'Popular restaurant for Chinese and continental cuisine.' },
    { place_id: 'chatkazz_vadapav', name: 'Chatkazz Vadapav', category: ['restaurant', 'food'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.4, entry_fee: 0, tags: ['street_food', 'vadapav', 'snacks'], description: 'Famous for delicious vadapav and street food.' },
    { place_id: 'coco_chai', name: 'Coco Chai Cafe', category: ['cafe', 'restaurant'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.3, entry_fee: 0, tags: ['cafe', 'tea', 'snacks'], description: 'Cozy cafe with variety of teas and light snacks.' },
    { place_id: 'emechanics_japanese_garden', name: 'Japanese Garden', category: ['garden', 'park'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.2, entry_fee: 10, tags: ['zen', 'peaceful', 'garden'], description: 'Tranquil Japanese-style garden with koi pond and bonsai.' },
    { place_id: 'baroda_dairy', name: 'Baroda Dairy', category: ['food', 'shopping'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.1, entry_fee: 0, tags: ['dairy', 'ice_cream', 'local'], description: 'Famous for fresh dairy products and ice creams.' },
    { place_id: 'emechanics_butterfly_park', name: 'Butterfly Park', category: ['park', 'nature'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.0, entry_fee: 20, tags: ['butterflies', 'nature', 'family'], description: 'Park with butterfly conservatory and nature trails.' },
    { place_id: 'reliance_mall', name: 'Reliance Mall', category: ['shopping_mall', 'shopping'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.1, entry_fee: 0, tags: ['shopping', 'food', 'entertainment'], description: 'Shopping mall with retail stores and food court.' },
    { place_id: 'emechanics_deer_park', name: 'Deer Park', category: ['park', 'zoo'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.0, entry_fee: 10, tags: ['deer', 'nature', 'family'], description: 'Park with spotted deer and peaceful walking trails.' },
    { place_id: 'seven_seas_mall', name: 'Seven Seas Mall', category: ['shopping_mall', 'shopping'], location: { lat: 22.3072, lng: 73.1812 }, rating: 4.2, entry_fee: 0, tags: ['shopping', 'brands', 'food'], description: 'Modern mall with international brands and dining.' },
    { place_id: 'emechanics_cactus_garden', name: 'Cactus Garden', category: ['garden', 'park'], location: { lat: 22.3072, lng: 73.1812 }, rating: 3.9, entry_fee: 10, tags: ['cactus', 'unique', 'nature'], description: 'Unique garden with rare cactus and succulent species.' }
  ],

  'agra': [
    {
      place_id: 'taj_mahal_agra',
      name: 'Taj Mahal',
      category: ['mausoleum', 'wonder'],
      location: { lat: 27.1751, lng: 78.0421 },
      rating: 4.6,
      entry_fee: 15,
      tags: ['unesco', 'wonder_of_world', 'love_story', 'marble'],
      description: 'Magnificent white marble mausoleum, UNESCO World Heritage site and Wonder of the World.',
      address: 'Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001, India'
    }
  ]
};

// Function to get places for a destination
function getRealPlacesForDestination(destination, interests = [], limit = 20) {
  const destLower = destination.toLowerCase();
  let places = [];

  // Direct city match
  if (realPlacesDatabase[destLower]) {
    places = [...realPlacesDatabase[destLower]];
  } else {
    // Search for partial matches
    Object.keys(realPlacesDatabase).forEach(city => {
      if (city.includes(destLower) || destLower.includes(city)) {
        places.push(...realPlacesDatabase[city]);
      }
    });

    // If still no matches, search by country/region
    if (places.length === 0) {
      const countryMatches = {
        'france': ['paris'],
        'uk': ['london'],
        'england': ['london'],
        'italy': ['rome'],
        'japan': ['tokyo', 'kyoto'],
        'usa': ['new york', 'los angeles'],
        'america': ['new york', 'los angeles'],
        'uae': ['dubai'],
        'egypt': ['cairo'],
        'australia': ['sydney'],
        'brazil': ['rio de janeiro'],
        'india': ['delhi', 'mumbai', 'agra']
      };

      Object.keys(countryMatches).forEach(country => {
        if (destLower.includes(country)) {
          countryMatches[country].forEach(city => {
            if (realPlacesDatabase[city]) {
              places.push(...realPlacesDatabase[city]);
            }
          });
        }
      });
    }
  }

  // Filter by interests if provided
  if (interests.length > 0) {
    const filteredPlaces = places.filter(place => {
      return interests.some(interest => 
        place.category.some(cat => cat.includes(interest.toLowerCase())) ||
        place.tags.some(tag => tag.includes(interest.toLowerCase()))
      );
    });
    
    // If filtered results are too few, include some general places
    if (filteredPlaces.length < 3) {
      places = [...filteredPlaces, ...places.slice(0, limit - filteredPlaces.length)];
    } else {
      places = filteredPlaces;
    }
  }

  // Remove duplicates and limit results
  const uniquePlaces = places.filter((place, index, self) => 
    index === self.findIndex(p => p.place_id === place.place_id)
  );

  return uniquePlaces.slice(0, limit);
}

// Function to search places by category
function searchPlacesByCategory(destination, category, limit = 10) {
  const allPlaces = getRealPlacesForDestination(destination, [], 100);
  
  const categoryPlaces = allPlaces.filter(place => 
    place.category.includes(category) || 
    place.tags.includes(category)
  );

  return categoryPlaces.slice(0, limit);
}

// Function to get popular places
function getPopularPlaces(destination, limit = 10) {
  const allPlaces = getRealPlacesForDestination(destination, [], 100);
  
  return allPlaces
    .filter(place => place.rating >= 4.0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

module.exports = {
  realPlacesDatabase,
  getRealPlacesForDestination,
  searchPlacesByCategory,
  getPopularPlaces
};