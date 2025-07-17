import axios from 'axios'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 3600 })

const URL = 'https://nominatim.openstreetmap.org/search'
const HEADERS = {
  'User-Agent': 'Triply/0.9',
}

/**
 * Get the latitude and longitude of a location using Nominatim.
 *
 * @param {string} country - The country name.
 * @param {string} region - The region or state name.
 * @param {string} city - The city name.
 * @returns {Promise<[number, number]>} - A tuple containing latitude and longitude.
 */
export const getLocation = async (country, region, city) => {
  const query = `${city},${region},${country}`

  // Return from cache if available
  const cached = cache.get(query)
  if (cached) {
    return cached
  }

  const params = {
    format: 'json',
    q: query,
  }

  try {
    const response = await axios.get(URL, {
      params,
      headers: HEADERS,
    })

    const data = response.data

    if (!data || data.length === 0) {
      throw new Error('No geocoding results found.')
    }

    const lat = parseFloat(data[0].lat)
    const lon = parseFloat(data[0].lon)

    const coords = [lat, lon]

    // Store in cache
    cache.set(query, coords)

    return coords
  } catch (error) {
    throw new Error(`Failed to fetch location: ${error.message}`)
  }
}
