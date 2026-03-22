import axios from 'axios'
import toast from 'react-hot-toast'

// Use dynamic hostname to handle cases where localhost isn't 127.0.0.1 or when accessing via network IP
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${ window.location.hostname }:3001`

// Create axios instances
export const authAPI = axios.create( {
  baseURL: API_BASE_URL,
  timeout: 10000,
} )

export const api = axios.create( {
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for ML operations (increased from 30s)
} )

// Request interceptor to add auth token
api.interceptors.request.use(
  ( config ) =>
  {
    const token = localStorage.getItem( 'access_token' )
    if ( token )
    {
      config.headers.Authorization = `Bearer ${ token }`
    }
    return config
  },
  ( error ) =>
  {
    return Promise.reject( error )
  }
)

// Response interceptor for token refresh
api.interceptors.response.use(
  ( response ) => response,
  async ( error ) =>
  {
    const originalRequest = error.config

    if ( error.response?.status === 401 && !originalRequest._retry )
    {
      originalRequest._retry = true

      try
      {
        const refreshToken = localStorage.getItem( 'refresh_token' )
        if ( refreshToken )
        {
          const response = await authAPI.post( '/auth/refresh', {
            refresh_token: refreshToken
          } )
          const { access_token } = response.data

          localStorage.setItem( 'access_token', access_token )
          api.defaults.headers.common[ 'Authorization' ] = `Bearer ${ access_token }`
          originalRequest.headers.Authorization = `Bearer ${ access_token }`

          return api( originalRequest )
        }
      } catch ( refreshError )
      {
        // Refresh failed, redirect to login
        localStorage.removeItem( 'access_token' )
        localStorage.removeItem( 'refresh_token' )
        window.location.href = '/login'
        return Promise.reject( refreshError )
      }
    }

    return Promise.reject( error )
  }
)

// API service functions
export const itineraryAPI = {
  create: ( data ) => api.post( '/itineraries', data ),
  save: ( data ) => api.post( '/itineraries/save', data ),
  list: ( params ) => api.get( '/itineraries', { params } ),
  get: ( id ) => api.get( `/itineraries/${ id }` ),
  update: ( id, data ) => api.patch( `/itineraries/${ id }`, data ),
  delete: ( id ) => api.delete( `/itineraries/${ id }` ),
}

export const placesAPI = {
  search: ( params ) => api.get( '/places/search', { params } ),
  get: ( id ) => api.get( `/places/${ id }` ),
  nearby: ( params ) => api.get( '/places/nearby', { params } ),
}

export const memoriesAPI = {
  create: ( formData ) => api.post( '/memories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  } ),
  list: ( params ) => api.get( '/memories', { params } ),
  get: ( id ) => api.get( `/memories/${ id }` ),
  delete: ( id ) => api.delete( `/memories/${ id }` ),
  getPostcard: ( id ) => api.get( `/memories/${ id }/postcard` ),
}

export const flightAPI = {
  search: ( params ) => api.post( '/flights/search', params ),
  price: ( params ) => api.post( '/flights/price', params ),
}

export const mlAPI = {
  parseNLP: ( text ) => api.post( '/ml/nlp/parse', { text } ),
  getRecommendations: ( data ) => api.post( '/ml/recommend', data ),
  optimizeItinerary: ( data ) => api.post( '/ml/optimize', data ),
  adjustWeather: ( data ) => api.post( '/ml/weather-adjust', data ),
  generateCaption: ( data ) => api.post( '/ml/postcard/caption', data ),
  generateStory: ( prompt ) => api.post( '/ml/nlp/generate', { prompt } ),
}

export const realtimeAPI = {
  generateItinerary: ( query, preferences ) => api.post( '/realtime/generate-itinerary', { query, preferences } ),
  parseQuery: ( query ) => api.post( '/realtime/parse-query', { query } ),
  getMLStatus: () => api.get( '/realtime/ml-status' ),
}

export const exportAPI = {
  pdf: ( data ) => api.post( '/export/pdf', data, {
    responseType: 'blob'
  } ),
  json: ( data ) => api.post( '/export/json', data, {
    responseType: 'blob'
  } ),
}

export const userAPI = {
  get: ( id ) => api.get( `/users/${ id }` ),
  update: ( id, data ) => api.patch( `/users/${ id }`, data ),
  export: ( id ) => api.get( `/users/${ id }/export` ),
  delete: ( id ) => api.delete( `/users/${ id }` ),
}

// Error handler utility
export const handleAPIError = ( error, defaultMessage = 'An error occurred' ) =>
{
  const message = error.response?.data?.error || error.message || defaultMessage
  toast.error( message )
  console.error( 'API Error:', error )
  return message
}