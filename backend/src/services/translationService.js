const logger = require('../utils/logger');

/**
 * Translation Service
 * Provides English translations for place names
 */
class TranslationService {
  constructor() {
    // Common translations for popular places
    this.translations = {
      // Spanish (Barcelona, Madrid, etc.)
      'Sagrada Família': 'Sagrada Familia (Holy Family)',
      'Parc Güell': 'Park Guell',
      'Casa Batlló': 'Casa Batllo (Batllo House)',
      'Casa Milà': 'Casa Mila (La Pedrera)',
      'Palau de la Música Catalana': 'Palace of Catalan Music',
      'Mercat de la Boqueria': 'La Boqueria Market',
      'Barri Gòtic': 'Gothic Quarter',
      'Montjuïc': 'Montjuic Hill',
      'Plaça d\'Espanya': 'Spain Square',
      'Plaça de Catalunya': 'Catalonia Square',
      'Passeig de Gràcia': 'Gracia Avenue',
      'La Rambla': 'The Ramblas',
      'Museu Picasso': 'Picasso Museum',
      'Museu Nacional d\'Art de Catalunya': 'National Art Museum of Catalonia',
      'Catedral de Barcelona': 'Barcelona Cathedral',
      'Basílica de Santa Maria del Mar': 'Basilica of Saint Mary of the Sea',
      'Palau Güell': 'Guell Palace',
      'Recinte Modernista de Sant Pau': 'Sant Pau Art Nouveau Site',
      'Parc de la Ciutadella': 'Citadel Park',
      'Tibidabo': 'Tibidabo Mountain',
      'Camp Nou': 'Camp Nou (FC Barcelona Stadium)',
      'Montserrat': 'Montserrat Mountain',
      
      // French (Paris, etc.)
      'Musée du Louvre': 'Louvre Museum',
      'Tour Eiffel': 'Eiffel Tower',
      'Arc de Triomphe': 'Arc de Triomphe (Triumphal Arch)',
      'Cathédrale Notre-Dame': 'Notre-Dame Cathedral',
      'Sacré-Cœur': 'Sacred Heart Basilica',
      'Musée d\'Orsay': 'Orsay Museum',
      'Champs-Élysées': 'Champs-Elysees Avenue',
      'Jardin du Luxembourg': 'Luxembourg Gardens',
      'Palais de Versailles': 'Palace of Versailles',
      'Château de Versailles': 'Versailles Castle',
      'Musée Rodin': 'Rodin Museum',
      'Sainte-Chapelle': 'Holy Chapel',
      'Jardin des Tuileries': 'Tuileries Garden',
      'Place de la Concorde': 'Concorde Square',
      'Quartier Latin': 'Latin Quarter',
      'Montmartre': 'Montmartre Hill',
      
      // Italian (Rome, Florence, etc.)
      'Colosseo': 'Colosseum',
      'Fontana di Trevi': 'Trevi Fountain',
      'Piazza di Spagna': 'Spanish Steps',
      'Basilica di San Pietro': 'St. Peter\'s Basilica',
      'Musei Vaticani': 'Vatican Museums',
      'Cappella Sistina': 'Sistine Chapel',
      'Pantheon': 'Pantheon',
      'Piazza Navona': 'Navona Square',
      'Castel Sant\'Angelo': 'Castle of the Holy Angel',
      'Galleria degli Uffizi': 'Uffizi Gallery',
      'Duomo di Firenze': 'Florence Cathedral',
      'Ponte Vecchio': 'Old Bridge',
      'Piazza del Duomo': 'Cathedral Square',
      'Basilica di Santa Maria del Fiore': 'Basilica of Saint Mary of the Flower',
      
      // German (Berlin, Munich, etc.)
      'Brandenburger Tor': 'Brandenburg Gate',
      'Reichstag': 'Reichstag Building (Parliament)',
      'Berliner Dom': 'Berlin Cathedral',
      'Museumsinsel': 'Museum Island',
      'Schloss Neuschwanstein': 'Neuschwanstein Castle',
      'Marienplatz': 'Mary\'s Square',
      'Englischer Garten': 'English Garden',
      'Frauenkirche': 'Church of Our Lady',
      
      // Japanese (Tokyo, Kyoto, etc.)
      '浅草寺': 'Senso-ji Temple (Asakusa)',
      '東京タワー': 'Tokyo Tower',
      '明治神宮': 'Meiji Shrine',
      '皇居': 'Imperial Palace',
      '渋谷': 'Shibuya',
      '新宿': 'Shinjuku',
      '秋葉原': 'Akihabara',
      '金閣寺': 'Kinkaku-ji (Golden Pavilion)',
      '清水寺': 'Kiyomizu-dera Temple',
      '伏見稲荷大社': 'Fushimi Inari Shrine',
      '嵐山': 'Arashiyama',
      '祇園': 'Gion District',
      
      // Portuguese (Lisbon, etc.)
      'Torre de Belém': 'Belem Tower',
      'Mosteiro dos Jerónimos': 'Jeronimos Monastery',
      'Castelo de São Jorge': 'St. George\'s Castle',
      'Praça do Comércio': 'Commerce Square',
      
      // Dutch (Amsterdam, etc.)
      'Rijksmuseum': 'National Museum',
      'Van Gogh Museum': 'Van Gogh Museum',
      'Anne Frank Huis': 'Anne Frank House',
      'Koninklijk Paleis': 'Royal Palace',
      
      // Greek (Athens, etc.)
      'Ακρόπολη': 'Acropolis',
      'Παρθενώνας': 'Parthenon',
      'Πλάκα': 'Plaka',
      
      // Turkish (Istanbul, etc.)
      'Ayasofya': 'Hagia Sophia',
      'Sultanahmet Camii': 'Blue Mosque',
      'Topkapı Sarayı': 'Topkapi Palace',
      'Kapalıçarşı': 'Grand Bazaar',
      
      // Arabic (Dubai, Cairo, etc.)
      'برج خليفة': 'Burj Khalifa',
      'الأهرامات': 'The Pyramids',
      'أبو الهول': 'The Sphinx',
      
      // Thai (Bangkok, etc.)
      'วัดพระแก้ว': 'Temple of the Emerald Buddha',
      'วัดโพธิ์': 'Wat Pho (Temple of the Reclining Buddha)',
      'วัดอรุณ': 'Wat Arun (Temple of Dawn)',
      'พระบรมมหาราชวัง': 'Grand Palace',
    };

    // Common word translations
    this.wordTranslations = {
      // Spanish
      'Iglesia': 'Church',
      'Catedral': 'Cathedral',
      'Basílica': 'Basilica',
      'Museo': 'Museum',
      'Palacio': 'Palace',
      'Plaza': 'Square',
      'Parque': 'Park',
      'Jardín': 'Garden',
      'Mercado': 'Market',
      'Castillo': 'Castle',
      'Torre': 'Tower',
      'Puente': 'Bridge',
      'Playa': 'Beach',
      'Montaña': 'Mountain',
      'Río': 'River',
      'Calle': 'Street',
      'Avenida': 'Avenue',
      'Barrio': 'Neighborhood',
      
      // French
      'Église': 'Church',
      'Cathédrale': 'Cathedral',
      'Musée': 'Museum',
      'Palais': 'Palace',
      'Place': 'Square',
      'Parc': 'Park',
      'Jardin': 'Garden',
      'Marché': 'Market',
      'Château': 'Castle',
      'Tour': 'Tower',
      'Pont': 'Bridge',
      'Rue': 'Street',
      'Avenue': 'Avenue',
      'Quartier': 'Quarter',
      
      // Italian
      'Chiesa': 'Church',
      'Cattedrale': 'Cathedral',
      'Basilica': 'Basilica',
      'Museo': 'Museum',
      'Palazzo': 'Palace',
      'Piazza': 'Square',
      'Parco': 'Park',
      'Giardino': 'Garden',
      'Mercato': 'Market',
      'Castello': 'Castle',
      'Torre': 'Tower',
      'Ponte': 'Bridge',
      'Via': 'Street',
      
      // German
      'Kirche': 'Church',
      'Dom': 'Cathedral',
      'Museum': 'Museum',
      'Schloss': 'Palace/Castle',
      'Platz': 'Square',
      'Park': 'Park',
      'Garten': 'Garden',
      'Markt': 'Market',
      'Burg': 'Castle',
      'Turm': 'Tower',
      'Brücke': 'Bridge',
      'Straße': 'Street',
      
      // Portuguese
      'Igreja': 'Church',
      'Catedral': 'Cathedral',
      'Museu': 'Museum',
      'Palácio': 'Palace',
      'Praça': 'Square',
      'Parque': 'Park',
      'Jardim': 'Garden',
      'Mercado': 'Market',
      'Castelo': 'Castle',
      'Torre': 'Tower',
      'Ponte': 'Bridge',
      'Praia': 'Beach',
      'Rua': 'Street',
      
      // Dutch
      'Kerk': 'Church',
      'Museum': 'Museum',
      'Paleis': 'Palace',
      'Plein': 'Square',
      'Park': 'Park',
      'Markt': 'Market',
      'Kasteel': 'Castle',
      'Toren': 'Tower',
      'Brug': 'Bridge',
      'Straat': 'Street',
    };
  }

  /**
   * Translate place name to English
   */
  translatePlaceName(name) {
    if (!name) return name;

    // Check for exact match first
    if (this.translations[name]) {
      return this.translations[name];
    }

    // Try word-by-word translation
    let translatedName = name;
    let hasTranslation = false;

    Object.entries(this.wordTranslations).forEach(([foreign, english]) => {
      const regex = new RegExp(`\\b${foreign}\\b`, 'gi');
      if (regex.test(translatedName)) {
        translatedName = translatedName.replace(regex, english);
        hasTranslation = true;
      }
    });

    // If we found translations, return both original and translated
    if (hasTranslation && translatedName !== name) {
      return `${name} (${translatedName})`;
    }

    // Return original if no translation found
    return name;
  }

  /**
   * Add English translation to place object
   */
  addTranslation(place) {
    if (!place || !place.name) return place;

    const originalName = place.name;
    const translatedName = this.translatePlaceName(originalName);

    // Only add translation if it's different from original
    if (translatedName !== originalName) {
      place.name_english = translatedName;
      place.name_original = originalName;
      place.name = translatedName; // Use translated name as primary
    }

    return place;
  }

  /**
   * Add translations to entire itinerary
   */
  addTranslationsToItinerary(itinerary) {
    if (!itinerary.plan) {
      return itinerary;
    }

    itinerary.plan.forEach(day => {
      if (day.places) {
        day.places = day.places.map(place => this.addTranslation(place));
      }
    });

    return itinerary;
  }
}

module.exports = new TranslationService();
