const logger = require('../utils/logger');

/**
 * Currency Service
 * Handles currency conversion and multi-currency display
 */
class CurrencyService {
  constructor() {
    // Exchange rates (USD as base)
    this.exchangeRates = {
      'USD': 1.00,
      'EUR': 0.92,    // Euro
      'GBP': 0.79,    // British Pound
      'JPY': 149.50,  // Japanese Yen
      'INR': 83.12,   // Indian Rupee
      'AUD': 1.52,    // Australian Dollar
      'CAD': 1.36,    // Canadian Dollar
      'CHF': 0.88,    // Swiss Franc
      'CNY': 7.24,    // Chinese Yuan
      'THB': 35.50,   // Thai Baht
      'SGD': 1.34,    // Singapore Dollar
      'AED': 3.67,    // UAE Dirham
      'NZD': 1.64,    // New Zealand Dollar
      'KRW': 1310.00, // South Korean Won
      'MXN': 17.05,   // Mexican Peso
      'BRL': 4.97,    // Brazilian Real
      'ZAR': 18.65,   // South African Rand
      'TRY': 28.50,   // Turkish Lira
      'RUB': 92.00,   // Russian Ruble
      'HKD': 7.82,    // Hong Kong Dollar
      'SEK': 10.50,   // Swedish Krona
      'NOK': 10.75,   // Norwegian Krone
      'DKK': 6.85,    // Danish Krone
      'PLN': 3.95,    // Polish Zloty
      'CZK': 22.50,   // Czech Koruna
      'HUF': 355.00,  // Hungarian Forint
      'ILS': 3.65,    // Israeli Shekel
      'CLP': 920.00,  // Chilean Peso
      'PHP': 56.00,   // Philippine Peso
      'IDR': 15600.00,// Indonesian Rupiah
      'MYR': 4.70,    // Malaysian Ringgit
      'VND': 24500.00,// Vietnamese Dong
      'EGP': 30.90,   // Egyptian Pound
      'MAD': 10.10,   // Moroccan Dirham
      'ARS': 350.00,  // Argentine Peso
      'COP': 3950.00, // Colombian Peso
      'PEN': 3.75,    // Peruvian Sol
      'ISK': 137.00,  // Icelandic Króna
    };

    // Country to currency mapping
    this.countryCurrencyMap = {
      // Europe
      'France': 'EUR',
      'Germany': 'EUR',
      'Italy': 'EUR',
      'Spain': 'EUR',
      'Portugal': 'EUR',
      'Netherlands': 'EUR',
      'Belgium': 'EUR',
      'Austria': 'EUR',
      'Greece': 'EUR',
      'Ireland': 'EUR',
      'Finland': 'EUR',
      'United Kingdom': 'GBP',
      'England': 'GBP',
      'Scotland': 'GBP',
      'Wales': 'GBP',
      'Switzerland': 'CHF',
      'Sweden': 'SEK',
      'Norway': 'NOK',
      'Denmark': 'DKK',
      'Poland': 'PLN',
      'Czech Republic': 'CZK',
      'Czechia': 'CZK',
      'Hungary': 'HUF',
      'Turkey': 'TRY',
      'Russia': 'RUB',
      'Iceland': 'ISK',
      
      // Asia
      'Japan': 'JPY',
      'China': 'CNY',
      'India': 'INR',
      'Thailand': 'THB',
      'Singapore': 'SGD',
      'South Korea': 'KRW',
      'Korea': 'KRW',
      'Hong Kong': 'HKD',
      'Malaysia': 'MYR',
      'Indonesia': 'IDR',
      'Philippines': 'PHP',
      'Vietnam': 'VND',
      'Israel': 'ILS',
      
      // Americas
      'United States': 'USD',
      'USA': 'USD',
      'Canada': 'CAD',
      'Mexico': 'MXN',
      'Brazil': 'BRL',
      'Argentina': 'ARS',
      'Chile': 'CLP',
      'Colombia': 'COP',
      'Peru': 'PEN',
      
      // Oceania
      'Australia': 'AUD',
      'New Zealand': 'NZD',
      
      // Middle East & Africa
      'UAE': 'AED',
      'Dubai': 'AED',
      'Abu Dhabi': 'AED',
      'South Africa': 'ZAR',
      'Egypt': 'EGP',
      'Morocco': 'MAD',
    };

    // City to country mapping (for popular cities)
    this.cityCountryMap = {
      // Europe
      'Paris': 'France',
      'London': 'United Kingdom',
      'Rome': 'Italy',
      'Barcelona': 'Spain',
      'Madrid': 'Spain',
      'Amsterdam': 'Netherlands',
      'Berlin': 'Germany',
      'Munich': 'Germany',
      'Vienna': 'Austria',
      'Prague': 'Czech Republic',
      'Budapest': 'Hungary',
      'Lisbon': 'Portugal',
      'Athens': 'Greece',
      'Dublin': 'Ireland',
      'Edinburgh': 'Scotland',
      'Stockholm': 'Sweden',
      'Copenhagen': 'Denmark',
      'Oslo': 'Norway',
      'Zurich': 'Switzerland',
      'Geneva': 'Switzerland',
      'Istanbul': 'Turkey',
      'Moscow': 'Russia',
      'Reykjavik': 'Iceland',
      
      // Asia
      'Tokyo': 'Japan',
      'Kyoto': 'Japan',
      'Osaka': 'Japan',
      'Beijing': 'China',
      'Shanghai': 'China',
      'Hong Kong': 'Hong Kong',
      'Singapore': 'Singapore',
      'Bangkok': 'Thailand',
      'Seoul': 'South Korea',
      'Mumbai': 'India',
      'Delhi': 'India',
      'Bangalore': 'India',
      'Kolkata': 'India',
      'Chennai': 'India',
      'Kuala Lumpur': 'Malaysia',
      'Bali': 'Indonesia',
      'Jakarta': 'Indonesia',
      'Manila': 'Philippines',
      'Hanoi': 'Vietnam',
      'Ho Chi Minh City': 'Vietnam',
      'Tel Aviv': 'Israel',
      'Jerusalem': 'Israel',
      
      // Americas
      'New York': 'United States',
      'Los Angeles': 'United States',
      'San Francisco': 'United States',
      'Chicago': 'United States',
      'Miami': 'United States',
      'Las Vegas': 'United States',
      'Toronto': 'Canada',
      'Vancouver': 'Canada',
      'Montreal': 'Canada',
      'Mexico City': 'Mexico',
      'Cancun': 'Mexico',
      'Rio de Janeiro': 'Brazil',
      'São Paulo': 'Brazil',
      'Buenos Aires': 'Argentina',
      'Santiago': 'Chile',
      'Lima': 'Peru',
      'Bogota': 'Colombia',
      
      // Oceania
      'Sydney': 'Australia',
      'Melbourne': 'Australia',
      'Auckland': 'New Zealand',
      
      // Middle East & Africa
      'Dubai': 'UAE',
      'Abu Dhabi': 'UAE',
      'Cairo': 'Egypt',
      'Marrakech': 'Morocco',
      'Cape Town': 'South Africa',
    };
  }

  /**
   * Get local currency for a destination
   */
  getLocalCurrency(destination) {
    // Try direct city match first
    if (this.cityCountryMap[destination]) {
      const country = this.cityCountryMap[destination];
      return this.countryCurrencyMap[country] || 'USD';
    }

    // Try country match
    if (this.countryCurrencyMap[destination]) {
      return this.countryCurrencyMap[destination];
    }

    // Default to USD
    return 'USD';
  }

  /**
   * Convert USD to target currency
   */
  convertFromUSD(amountUSD, targetCurrency) {
    const rate = this.exchangeRates[targetCurrency] || 1;
    return Math.round(amountUSD * rate * 100) / 100;
  }

  /**
   * Format currency with symbol
   */
  formatCurrency(amount, currency) {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'INR': '₹',
      'AUD': 'A$',
      'CAD': 'C$',
      'CHF': 'CHF',
      'CNY': '¥',
      'THB': '฿',
      'SGD': 'S$',
      'AED': 'AED',
      'NZD': 'NZ$',
      'KRW': '₩',
      'MXN': 'MX$',
      'BRL': 'R$',
      'ZAR': 'R',
      'TRY': '₺',
      'RUB': '₽',
      'HKD': 'HK$',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'ILS': '₪',
      'CLP': 'CLP$',
      'PHP': '₱',
      'IDR': 'Rp',
      'MYR': 'RM',
      'VND': '₫',
      'EGP': 'E£',
      'MAD': 'MAD',
      'ARS': 'AR$',
      'COP': 'COL$',
      'PEN': 'S/',
      'ISK': 'kr',
    };

    const symbol = symbols[currency] || currency;
    
    // Format based on currency
    if (['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'HUF'].includes(currency)) {
      // No decimals for these currencies
      return `${symbol}${Math.round(amount)}`;
    } else {
      return `${symbol}${amount.toFixed(2)}`;
    }
  }

  /**
   * Add multi-currency pricing to a place object
   */
  addMultiCurrencyPricing(place, destination) {
    if (!place.entry_fee && place.entry_fee !== 0) {
      return place;
    }

    const localCurrency = this.getLocalCurrency(destination);
    const usdAmount = place.entry_fee;
    
    // Convert to local currency and INR
    const localAmount = this.convertFromUSD(usdAmount, localCurrency);
    const inrAmount = this.convertFromUSD(usdAmount, 'INR');

    // Add pricing object
    place.pricing = {
      usd: {
        amount: usdAmount,
        formatted: this.formatCurrency(usdAmount, 'USD')
      },
      local: {
        currency: localCurrency,
        amount: localAmount,
        formatted: this.formatCurrency(localAmount, localCurrency)
      },
      inr: {
        amount: inrAmount,
        formatted: this.formatCurrency(inrAmount, 'INR')
      },
      display: `${this.formatCurrency(usdAmount, 'USD')} (${this.formatCurrency(localAmount, localCurrency)} / ${this.formatCurrency(inrAmount, 'INR')})`
    };

    return place;
  }

  /**
   * Add multi-currency pricing to entire itinerary
   */
  addMultiCurrencyToItinerary(itinerary, destination) {
    if (!itinerary.plan) {
      return itinerary;
    }

    itinerary.plan.forEach(day => {
      if (day.places) {
        day.places = day.places.map(place => 
          this.addMultiCurrencyPricing(place, destination)
        );
      }
    });

    return itinerary;
  }
}

module.exports = new CurrencyService();
