/**
 * OpenRouteService API client
 * Documentation: https://openrouteservice.org/dev/#/api-docs
 *
 * Important: To use this service, sign up for a free API key at:
 * https://openrouteservice.org/dev/#/signup
 */

// API key can be configured here or using environment variables
// For development, you can set your key here directly (not recommended for production)
const DEFAULT_API_KEY =
  'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYxNjQ2NmQ5MzNhMzQzMmQ4ZDY1N2QwNmNmNzc3OWI5IiwiaCI6Im11cm11cjY0In0=' // OpenRouteService API key
const BASE_URL = 'https://api.openrouteservice.org/v2'

// Get API key from environment variables if available, otherwise use default
const API_KEY = import.meta.env.VITE_OPENROUTE_API_KEY || DEFAULT_API_KEY

// Helper function to check if API key is set
const checkApiKey = () => {
  // Since we're using a valid API key, we'll just check if it's not empty
  if (!API_KEY) {
    throw new Error(
      'OpenRouteService API key is not set. Please sign up at https://openrouteservice.org/dev/#/signup and either update the DEFAULT_API_KEY in openRouteService.js or set the VITE_OPENROUTE_API_KEY environment variable.'
    )
  }
}

/**
 * Get directions between multiple waypoints
 * @param {Array<Array<number>>} coordinates - Array of [longitude, latitude] pairs
 * @param {string} profile - Routing profile (driving-car, foot-walking, cycling-regular, etc.)
 * @returns {Promise<Object>} - GeoJSON route data
 */
export const getDirections = async (coordinates, profile = 'foot-walking') => {
  try {
    // Check if API key is set
    checkApiKey()

    // OpenRouteService requires coordinates in [longitude, latitude] format
    const body = {
      coordinates,
      format: 'geojson',
      preference: 'recommended',
      units: 'km',
      language: 'en',
      instructions: false,
    }

    const response = await fetch(`${BASE_URL}/directions/${profile}/geojson`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json, application/geo+json, application/gpx+xml',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch route')
    }

    return response.json()
  } catch (error) {
    console.error('Error getting directions:', error)
    throw error
  }
}

/**
 * Get optimized routes for multiple waypoints (for trip planning)
 * @param {Array<Array<number>>} coordinates - Array of [longitude, latitude] pairs
 * @param {string} profile - Routing profile
 * @returns {Promise<Object>} - Optimized route data
 */
export const getOptimizedRoute = async (
  coordinates,
  profile = 'foot-walking'
) => {
  try {
    // Check if API key is set
    checkApiKey()

    const body = {
      coordinates,
      format: 'geojson',
      roundtrip: false, // Set to true if you want to return to the starting point
      units: 'km',
    }

    const response = await fetch(`${BASE_URL}/optimization`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to optimize route')
    }

    return response.json()
  } catch (error) {
    console.error('Error optimizing route:', error)
    throw error
  }
}
