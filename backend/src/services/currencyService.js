const logger = require('../utils/logger');

/**
 * Currency Service
 * Handles smart currency detection, budget conversion, and local price formatting.
 */
class CurrencyService {
  constructor() {
    // Exchange rates (USD as base)
    this.exchangeRates = {
      'USD': 1.00, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 149.50, 'INR': 83.12,
      'AUD': 1.52, 'CAD': 1.36, 'CHF': 0.88, 'CNY': 7.24, 'THB': 35.50,
      'SGD': 1.34, 'AED': 3.67, 'NZD': 1.64, 'KRW': 1310.00, 'MXN': 17.05,
      'BRL': 4.97, 'ZAR': 18.65, 'TRY': 28.50, 'RUB': 92.00, 'HKD': 7.82,
      'SEK': 10.50, 'NOK': 10.75, 'DKK': 6.85, 'PLN': 3.95, 'CZK': 22.50,
      'HUF': 355.00, 'ILS': 3.65, 'CLP': 920.00, 'PHP': 56.00, 'IDR': 15600.00,
      'MYR': 4.70, 'VND': 24500.00, 'EGP': 30.90, 'MAD': 10.10, 'ARS': 350.00,
      'COP': 3950.00, 'PEN': 3.75, 'ISK': 137.00,
    };

    this.currencySymbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
      'AUD': 'A$', 'CAD': 'C$', 'CHF': 'CHF', 'CNY': '¥', 'THB': '฿',
      'SGD': 'S$', 'AED': 'AED', 'NZD': 'NZ$', 'KRW': '₩', 'MXN': 'MX$',
      'BRL': 'R$', 'ZAR': 'R', 'TRY': '₺', 'RUB': '₽', 'HKD': 'HK$',
      'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr', 'PLN': 'zł', 'CZK': 'Kč',
      'HUF': 'Ft', 'ILS': '₪', 'CLP': 'CLP$', 'PHP': '₱', 'IDR': 'Rp',
      'MYR': 'RM', 'VND': '₫', 'EGP': 'E£', 'MAD': 'MAD', 'ARS': 'AR$',
      'COP': 'COL$', 'PEN': 'S/', 'ISK': 'kr',
    };

    this.countryCurrencyMap = {
      'France': 'EUR', 'Germany': 'EUR', 'Italy': 'EUR', 'Spain': 'EUR',
      'Portugal': 'EUR', 'Netherlands': 'EUR', 'Belgium': 'EUR', 'Austria': 'EUR',
      'Greece': 'EUR', 'Ireland': 'EUR', 'Finland': 'EUR',
      'United Kingdom': 'GBP', 'England': 'GBP', 'Scotland': 'GBP', 'Wales': 'GBP',
      'Switzerland': 'CHF', 'Sweden': 'SEK', 'Norway': 'NOK', 'Denmark': 'DKK',
      'Poland': 'PLN', 'Czech Republic': 'CZK', 'Czechia': 'CZK',
      'Hungary': 'HUF', 'Turkey': 'TRY', 'Russia': 'RUB', 'Iceland': 'ISK',
      'Japan': 'JPY', 'China': 'CNY', 'India': 'INR', 'Thailand': 'THB',
      'Singapore': 'SGD', 'South Korea': 'KRW', 'Korea': 'KRW', 'Hong Kong': 'HKD',
      'Malaysia': 'MYR', 'Indonesia': 'IDR', 'Philippines': 'PHP',
      'Vietnam': 'VND', 'Israel': 'ILS',
      'United States': 'USD', 'USA': 'USD', 'Canada': 'CAD', 'Mexico': 'MXN',
      'Brazil': 'BRL', 'Argentina': 'ARS', 'Chile': 'CLP', 'Colombia': 'COP', 'Peru': 'PEN',
      'Australia': 'AUD', 'New Zealand': 'NZD',
      'UAE': 'AED', 'Dubai': 'AED', 'Abu Dhabi': 'AED',
      'South Africa': 'ZAR', 'Egypt': 'EGP', 'Morocco': 'MAD',
    };

    this.cityCountryMap = {
      'Paris': 'France', 'London': 'United Kingdom', 'Rome': 'Italy',
      'Barcelona': 'Spain', 'Madrid': 'Spain', 'Amsterdam': 'Netherlands',
      'Berlin': 'Germany', 'Munich': 'Germany', 'Vienna': 'Austria',
      'Prague': 'Czech Republic', 'Budapest': 'Hungary', 'Lisbon': 'Portugal',
      'Athens': 'Greece', 'Dublin': 'Ireland', 'Edinburgh': 'Scotland',
      'Stockholm': 'Sweden', 'Copenhagen': 'Denmark', 'Oslo': 'Norway',
      'Zurich': 'Switzerland', 'Geneva': 'Switzerland', 'Istanbul': 'Turkey',
      'Moscow': 'Russia', 'Reykjavik': 'Iceland',
      'Tokyo': 'Japan', 'Kyoto': 'Japan', 'Osaka': 'Japan',
      'Beijing': 'China', 'Shanghai': 'China', 'Hong Kong': 'Hong Kong',
      'Singapore': 'Singapore', 'Bangkok': 'Thailand', 'Seoul': 'South Korea',
      'Mumbai': 'India', 'Delhi': 'India', 'New Delhi': 'India',
      'Bangalore': 'India', 'Bengaluru': 'India', 'Kolkata': 'India',
      'Chennai': 'India', 'Hyderabad': 'India', 'Pune': 'India',
      'Ahmedabad': 'India', 'Jaipur': 'India', 'Agra': 'India',
      'Varanasi': 'India', 'Goa': 'India', 'Kochi': 'India',
      'Kuala Lumpur': 'Malaysia', 'Bali': 'Indonesia', 'Jakarta': 'Indonesia',
      'Manila': 'Philippines', 'Hanoi': 'Vietnam', 'Ho Chi Minh City': 'Vietnam',
      'Tel Aviv': 'Israel', 'Jerusalem': 'Israel',
      'New York': 'United States', 'Los Angeles': 'United States',
      'San Francisco': 'United States', 'Chicago': 'United States',
      'Miami': 'United States', 'Las Vegas': 'United States',
      'Toronto': 'Canada', 'Vancouver': 'Canada', 'Montreal': 'Canada',
      'Mexico City': 'Mexico', 'Cancun': 'Mexico',
      'Rio de Janeiro': 'Brazil', 'São Paulo': 'Brazil',
      'Buenos Aires': 'Argentina', 'Santiago': 'Chile', 'Lima': 'Peru', 'Bogota': 'Colombia',
      'Sydney': 'Australia', 'Melbourne': 'Australia', 'Auckland': 'New Zealand',
      'Dubai': 'UAE', 'Abu Dhabi': 'UAE', 'Cairo': 'Egypt',
      'Marrakech': 'Morocco', 'Cape Town': 'South Africa',
    };

    // Realistic local meal prices in LOCAL currency (not USD)
    this.localMealPrices = {
      'INR': {
        low:    { breakfast: 100,  lunch: 200,  dinner: 350  },
        medium: { breakfast: 250,  lunch: 500,  dinner: 900  },
        high:   { breakfast: 600,  lunch: 1200, dinner: 2500 }
      },
      'JPY': {
        low:    { breakfast: 500,  lunch: 800,  dinner: 1500 },
        medium: { breakfast: 1000, lunch: 1500, dinner: 3000 },
        high:   { breakfast: 2000, lunch: 3500, dinner: 8000 }
      },
      'THB': {
        low:    { breakfast: 80,   lunch: 150,  dinner: 300  },
        medium: { breakfast: 200,  lunch: 400,  dinner: 800  },
        high:   { breakfast: 500,  lunch: 1000, dinner: 2500 }
      },
      'IDR': {
        low:    { breakfast: 15000, lunch: 30000,  dinner: 60000  },
        medium: { breakfast: 40000, lunch: 80000,  dinner: 180000 },
        high:   { breakfast: 100000, lunch: 200000, dinner: 500000 }
      },
      'VND': {
        low:    { breakfast: 30000,  lunch: 60000,  dinner: 120000 },
        medium: { breakfast: 80000,  lunch: 160000, dinner: 350000 },
        high:   { breakfast: 200000, lunch: 400000, dinner: 900000 }
      },
      'KRW': {
        low:    { breakfast: 5000,  lunch: 10000, dinner: 20000  },
        medium: { breakfast: 12000, lunch: 25000, dinner: 50000  },
        high:   { breakfast: 25000, lunch: 60000, dinner: 150000 }
      },
      'MYR': {
        low:    { breakfast: 5,  lunch: 10, dinner: 20  },
        medium: { breakfast: 15, lunch: 30, dinner: 60  },
        high:   { breakfast: 35, lunch: 70, dinner: 180 }
      },
      'EUR': {
        low:    { breakfast: 5,  lunch: 10, dinner: 20  },
        medium: { breakfast: 12, lunch: 20, dinner: 40  },
        high:   { breakfast: 25, lunch: 45, dinner: 120 }
      },
      'GBP': {
        low:    { breakfast: 5,  lunch: 10, dinner: 20  },
        medium: { breakfast: 10, lunch: 18, dinner: 38  },
        high:   { breakfast: 20, lunch: 40, dinner: 110 }
      },
      'AED': {
        low:    { breakfast: 20,  lunch: 40,  dinner: 80  },
        medium: { breakfast: 45,  lunch: 80,  dinner: 170 },
        high:   { breakfast: 100, lunch: 200, dinner: 500 }
      },
      'USD': {
        low:    { breakfast: 8,  lunch: 15, dinner: 30  },
        medium: { breakfast: 15, lunch: 30, dinner: 65  },
        high:   { breakfast: 30, lunch: 60, dinner: 150 }
      },
    };
  }

  /** Get the local currency code for a destination string */
  getLocalCurrency(destination) {
    if (!destination) return 'USD';
    const dest = destination.trim();

    if (this.cityCountryMap[dest]) {
      return this.countryCurrencyMap[this.cityCountryMap[dest]] || 'USD';
    }
    for (const [city, country] of Object.entries(this.cityCountryMap)) {
      if (dest.toLowerCase().includes(city.toLowerCase()) ||
          city.toLowerCase().includes(dest.toLowerCase())) {
        return this.countryCurrencyMap[country] || 'USD';
      }
    }
    return this.countryCurrencyMap[dest] || 'USD';
  }

  /**
   * Parse budget input — $5000, ₹50000, 50000INR, plain 50000, etc.
   * Returns { amount, currency, localAmount, localCurrency, isConverted }
   */
  parseBudgetInput(budgetStr, destination) {
    const localCurrency = this.getLocalCurrency(destination);
    let detectedCurrency = null;
    let rawAmount = 0;

    if (typeof budgetStr === 'number') {
      rawAmount = budgetStr;
      detectedCurrency = localCurrency;
    } else {
      const str = String(budgetStr).trim();
      if (/^\$/.test(str))       { detectedCurrency = 'USD'; rawAmount = parseFloat(str.replace(/[$,]/g, '')); }
      else if (/^₹/.test(str))  { detectedCurrency = 'INR'; rawAmount = parseFloat(str.replace(/[₹,]/g, '')); }
      else if (/^€/.test(str))  { detectedCurrency = 'EUR'; rawAmount = parseFloat(str.replace(/[€,]/g, '')); }
      else if (/^£/.test(str))  { detectedCurrency = 'GBP'; rawAmount = parseFloat(str.replace(/[£,]/g, '')); }
      else if (/^¥/.test(str))  { detectedCurrency = 'JPY'; rawAmount = parseFloat(str.replace(/[¥,]/g, '')); }
      else {
        const suffixMatch = str.match(/^([\d,]+(?:\.\d+)?)\s*([A-Z]{3})$/i);
        if (suffixMatch) {
          rawAmount = parseFloat(suffixMatch[1].replace(/,/g, ''));
          const code = suffixMatch[2].toUpperCase();
          if (this.exchangeRates[code]) detectedCurrency = code;
        }
        if (!detectedCurrency) {
          const rsMatch = str.match(/^(?:rs\.?\s*)([\d,]+)/i);
          if (rsMatch) { detectedCurrency = 'INR'; rawAmount = parseFloat(rsMatch[1].replace(/,/g, '')); }
        }
        if (!detectedCurrency) {
          rawAmount = parseFloat(str.replace(/,/g, ''));
          detectedCurrency = localCurrency;
        }
      }
    }

    if (isNaN(rawAmount) || rawAmount <= 0) { rawAmount = 50000; detectedCurrency = localCurrency; }

    if (detectedCurrency === localCurrency) {
      return { amount: rawAmount, currency: detectedCurrency, isConverted: false, localAmount: rawAmount, localCurrency };
    }

    const amountInUSD = rawAmount / (this.exchangeRates[detectedCurrency] || 1);
    const localAmount = Math.round(amountInUSD * (this.exchangeRates[localCurrency] || 1));
    logger.info(`💱 Budget: ${this.getSymbol(detectedCurrency)}${rawAmount} → ${this.getSymbol(localCurrency)}${localAmount}`);
    return { amount: rawAmount, currency: detectedCurrency, isConverted: true, localAmount, localCurrency };
  }

  /** Get realistic local meal prices for a destination and budget level */
  getLocalMealPrices(destination, budgetLevel = 'medium') {
    const currency = this.getLocalCurrency(destination);
    const prices = this.localMealPrices[currency] || this.localMealPrices['USD'];
    return { ...(prices[budgetLevel] || prices['medium']), currency };
  }

  /** Determine budget level using locale-aware thresholds */
  getBudgetLevel(dailyBudgetLocal, localCurrency) {
    const thresholds = {
      'INR': { low: 2000,   medium: 5000   },
      'JPY': { low: 5000,   medium: 15000  },
      'THB': { low: 1500,   medium: 4000   },
      'IDR': { low: 300000, medium: 800000 },
      'VND': { low: 500000, medium: 1500000},
      'KRW': { low: 50000,  medium: 150000 },
      'MYR': { low: 80,     medium: 200    },
      'EUR': { low: 80,     medium: 200    },
      'GBP': { low: 70,     medium: 175    },
      'AED': { low: 200,    medium: 600    },
      'USD': { low: 80,     medium: 250    },
    };
    const t = thresholds[localCurrency] || thresholds['USD'];
    if (dailyBudgetLocal < t.low)    return 'low';
    if (dailyBudgetLocal < t.medium) return 'medium';
    return 'high';
  }

  /** Get currency symbol */
  getSymbol(currency) { return this.currencySymbols[currency] || currency; }

  /** Convert USD amount to target currency */
  convertFromUSD(amountUSD, targetCurrency) {
    if (!amountUSD) return 0;
    return Math.round(amountUSD * (this.exchangeRates[targetCurrency] || 1) * 100) / 100;
  }

  /** Convert USD to local currency (integer result) */
  toLocalCurrency(usdAmount, localCurrency) {
    if (!usdAmount) return 0;
    return Math.round(usdAmount * (this.exchangeRates[localCurrency] || 1));
  }

  /** Format a number with the correct currency symbol */
  formatCurrency(amount, currency) {
    if (amount === 0) return 'Free';
    const symbol = this.getSymbol(currency);
    if (['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'HUF', 'INR'].includes(currency)) {
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
    return `${symbol}${parseFloat(amount.toFixed(2)).toLocaleString()}`;
  }

  /**
   * Add local-currency pricing to a place object.
   * IMPORTANT: Skips places that already have entry_fee_formatted set (e.g. meal entries
   * pre-formatted in local currency by intelligentItineraryBuilder) to avoid double-conversion.
   * For activity places from the database (entry_fee stored in USD), converts correctly.
   */
  addMultiCurrencyPricing(place, destination) {
    if (place.entry_fee === undefined || place.entry_fee === null) return place;

    // Already formatted by the builder → skip to prevent double-conversion
    if (place.entry_fee_formatted !== undefined) return place;

    // Explicitly skip meal types since the builder returns them in local currency
    if (place.activity_type && ['breakfast', 'lunch', 'dinner'].includes(place.activity_type)) {
      return place;
    }

    const localCurrency = this.getLocalCurrency(destination);
    const usdAmount = place.entry_fee; // database places store entry_fee in USD

    const localAmount = this.toLocalCurrency(usdAmount, localCurrency);
    const formattedLocal = this.formatCurrency(localAmount, localCurrency);

    place.entry_fee_local     = localAmount;
    place.currency            = localCurrency;
    place.currency_symbol     = this.getSymbol(localCurrency);
    place.entry_fee_formatted = formattedLocal;
    place.pricing = {
      local:   { currency: localCurrency, amount: localAmount, formatted: formattedLocal },
      usd:     { amount: usdAmount, formatted: usdAmount === 0 ? 'Free' : `$${usdAmount}` },
      display: formattedLocal
    };

    return place;
  }

  /** Apply multi-currency pricing to every place in an itinerary */
  addMultiCurrencyToItinerary(itinerary, destination) {
    if (!itinerary || !itinerary.plan) return itinerary;
    itinerary.plan.forEach(day => {
      if (day.places) {
        day.places = day.places.map(p => this.addMultiCurrencyPricing(p, destination));
      }
    });
    return itinerary;
  }
}

module.exports = new CurrencyService();
