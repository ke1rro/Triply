import axios from 'axios'

const URL = 'http://localhost:8000/'

export const searchPlaces = async ({
  latitude,
  longitude,
  radius,
  categories = null,
  query = null,
  offset = 0,
  limit = null,
  sortBy = null,
}) => {
  const params = new URLSearchParams()
  params.append('lat', latitude)
  params.append('lon', longitude)
  params.append('radius', radius)
  params.append('offset', offset)

  if (categories) {
    if (Array.isArray(categories)) {
      params.append('categories', categories.join(','))
    } else {
      params.append('categories', categories)
    }
  }

  if (query) {
    params.append('q', query)
  }

  if (limit) {
    params.append('limit', limit)
  }

  if (sortBy) {
    params.append('sort_by', sortBy)
  }

  const response = await axios.get(URL + 'search', { params: params })
  return response.data['points']
}

export const getPlace = async (id) => {
  const params = new URLSearchParams()
  params.append('id', id)

  try {
    const response = await axios.get(URL + 'place', { params: params })
    return response.data['point']
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null
    }

    throw error
  }
}
