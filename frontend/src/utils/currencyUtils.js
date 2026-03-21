/**
 * Frontend currency utilities.
 * Determines the correct currency symbol for a destination
 * and formats prices — no backend dependency needed.
 */

const CITY_CURRENCY = {
  // India → INR
  Delhi: 'INR', 'New Delhi': 'INR', Mumbai: 'INR', Bangalore: 'INR',
  Bengaluru: 'INR', Chennai: 'INR', Kolkata: 'INR', Hyderabad: 'INR',
  Pune: 'INR', Ahmedabad: 'INR', Jaipur: 'INR', Agra: 'INR',
  Varanasi: 'INR', Goa: 'INR', Kochi: 'INR', Indore: 'INR',
  Bhopal: 'INR', Lucknow: 'INR', Chandigarh: 'INR', Amritsar: 'INR',
  // Europe → EUR
  Paris: 'EUR', Berlin: 'EUR', Rome: 'EUR', Barcelona: 'EUR',
  Madrid: 'EUR', Amsterdam: 'EUR', Vienna: 'EUR', Prague: 'EUR',
  Budapest: 'EUR', Lisbon: 'EUR', Athens: 'EUR', Dublin: 'EUR',
  Milan: 'EUR', Frankfurt: 'EUR', Munich: 'EUR', Brussels: 'EUR',
  // UK → GBP
  London: 'GBP', Edinburgh: 'GBP', Manchester: 'GBP', Birmingham: 'GBP',
  // Japan → JPY
  Tokyo: 'JPY', Kyoto: 'JPY', Osaka: 'JPY', Hiroshima: 'JPY',
  // China → CNY
  Beijing: 'CNY', Shanghai: 'CNY', Guangzhou: 'CNY', Shenzhen: 'CNY',
  // Thailand → THB
  Bangkok: 'THB', 'Chiang Mai': 'THB', Phuket: 'THB', Pattaya: 'THB',
  // South Korea → KRW
  Seoul: 'KRW', Busan: 'KRW',
  // Singapore → SGD
  Singapore: 'SGD',
  // Malaysia → MYR
  'Kuala Lumpur': 'MYR',
  // Indonesia → IDR
  Bali: 'IDR', Jakarta: 'IDR',
  // Vietnam → VND
  Hanoi: 'VND', 'Ho Chi Minh City': 'VND',
  // UAE → AED
  Dubai: 'AED', 'Abu Dhabi': 'AED',
  // USA → USD
  'New York': 'USD', 'Los Angeles': 'USD', 'Las Vegas': 'USD',
  Chicago: 'USD', Miami: 'USD', 'San Francisco': 'USD',
  // Australia → AUD
  Sydney: 'AUD', Melbourne: 'AUD',
  // Canada → CAD
  Toronto: 'CAD', Vancouver: 'CAD',
}

const CURRENCY_SYMBOL = {
  INR: '₹', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
  THB: '฿', KRW: '₩', SGD: 'S$', MYR: 'RM', IDR: 'Rp',
  VND: '₫', AED: 'AED', USD: '$', AUD: 'A$', CAD: 'C$',
}

// Exchange rates from USD (approximate)
const USD_TO = {
  INR: 83, EUR: 0.92, GBP: 0.79, JPY: 149, CNY: 7.2,
  THB: 35, KRW: 1310, SGD: 1.34, MYR: 4.7, IDR: 15600,
  VND: 24500, AED: 3.67, USD: 1, AUD: 1.52, CAD: 1.36,
}

/**
 * Detect currency code for a destination string (city or country).
 */
export function getCurrencyForDestination(destination) {
  if (!destination) return 'USD'
  const dest = destination.trim()

  // Exact city match
  if (CITY_CURRENCY[dest]) return CITY_CURRENCY[dest]

  // Partial match (case-insensitive)
  const destLower = dest.toLowerCase()
  for (const [city, code] of Object.entries(CITY_CURRENCY)) {
    if (destLower.includes(city.toLowerCase()) ||
        city.toLowerCase().includes(destLower)) {
      return code
    }
  }

  return 'USD'
}

/**
 * Get the symbol for a currency code.
 */
export function getCurrencySymbol(currencyCode) {
  return CURRENCY_SYMBOL[currencyCode] || '$'
}

/**
 * Format a fee (number) for a given place + destination.
 *
 * Priority:
 *  1. place.entry_fee_formatted  (pre-formatted by backend)
 *  2. place.pricing?.local?.formatted
 *  3. Derive from entry_fee + detect currency from destination
 *
 * For meal places (breakfast/lunch/dinner) entry_fee is already in local currency.
 * For activity places from the database entry_fee is stored in USD — convert it.
 */
export function formatEntryFee(place, destination) {
  // 1. Backend already formatted it ✅
  if (place.entry_fee_formatted) return place.entry_fee_formatted
  if (place.pricing?.local?.formatted) return place.pricing.local.formatted
  if (place.entry_fee === undefined || place.entry_fee === null) return null
  if (place.entry_fee === 0) return 'Free'

  const currency = getCurrencyForDestination(destination)
  const symbol   = getCurrencySymbol(currency)
  const amount   = place.entry_fee

  // Meal entries set by the builder already have entry_fee in local currency
  const isMealEntry = ['breakfast', 'lunch', 'dinner'].includes(place.activity_type)

  if (isMealEntry) {
    // amount is already in local currency (e.g. ₹500)
    return `${symbol}${Math.round(amount).toLocaleString()}`
  }

  // Activity places — entry_fee is in USD, convert to local
  const rate = USD_TO[currency] || 1
  const localAmount = Math.round(amount * rate)
  if (localAmount === 0) return 'Free'
  return `${symbol}${localAmount.toLocaleString()}`
}
