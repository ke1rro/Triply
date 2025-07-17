import axios from 'axios'

const URL = 'https://overpass-api.de/api/interpreter'
const QUERY_HEADER = '[out:json][timeout:25];('
const QUERY_FOOTER = ');out center;'

const CATEGORIES_TO_TAGS = {
  restaurants: ['amenity=restaurant', 'amenity=fast_food'],
  bars: ['amenity=bar', 'amenity=pub'],
  coffee: ['amenity=cafe', 'shop=coffee'],
  gyms: [
    'leisure=fitness_centre',
    'leisure=fitness_station',
    'leisure=sports_centre',
  ],
  movies: ['amenity=cinema'],
  museums: ['tourism=museum'],
  arts: ['tourism=artwork'],
  attractions: ['tourism=attraction'],
  libraries: ['amenity=library'],
  sightseeing: [
    'tourism=viewpoint',
    'historic=monument',
    'historic=ruins',
    'historic=archaeological_site',
    'historic=memorial',
    'historic=wayside_cross',
    'historic=boundary_stone',
    'historic=wayside_shrine',
    'historic=tomb',
  ],
  nightlife: ['amenity=nightclub'],
  groceries: [
    'shop=supermarket',
    'shop=convenience',
    'shop=greengrocer',
    'shop=butcher',
    'shop=bakery',
    'shop=seafood',
    'shop=dairy',
    'shop=wine',
    'shop=beverages',
    'shop=farm',
    'shop=frozen_food',
  ],
  stores: [
    'shop=kiosk',
    'shop=general',
    'shop=variety_store',
    'shop=newsagent',
    'shop=outpost',
    'shop=clothes',
    'shop=shoes',
    'shop=cosmetics',
    'shop=jewelry',
    'shop=furniture',
    'shop=hardware',
    'shop=doityourself',
    'shop=electronics',
    'shop=mobile_phone',
    'shop=florist',
    'shop=pet',
    'shop=stationery',
    'shop=toys',
    'shop=books',
    'shop=gift',
    'shop=department_store',
    'shop=houseware',
    'shop=second_hand',
    'shop=sports',
    'shop=optician',
    'shop=tailor',
    'shop=beauty',
    'shop=baby_goods',
    'shop=pastry',
    'shop=fabric',
    'shop=photo',
    'shop=dry_cleaning',
    'shop=copyshop',
    'shop=medical_supply',
    'shop=trade',
    'shop=ticket',
    'shop=confectionery',
    'shop=chemist',
    'shop=tobacco',
    'shop=outdoor',
    'shop=garden_centre',
    'shop=bathroom_furnishing',
  ],
  hotels: [
    'tourism=hotel',
    'tourism=guest_house',
    'tourism=hostel',
    'tourism=apartment',
    'tourism=motel',
  ],
  atms: ['amenity=atm'],
  gas: ['amenity=fuel', 'amenity=charging_station'],
  car_rental: ['amenity=car_rental'],
  outdoor_activities: [
    'leisure=fishing',
    'leisure=pitch',
    'shop=fishing',
    'tourism=camp_site',
    'leisure=park',
    'tourism=picnic_site',
    'leisure=playground',
    'leisure=firepit',
    'leisure=picnic_table',
  ],
}

const CATEGORIES = new Set([...Object.keys(CATEGORIES_TO_TAGS), 'any'])

const TAGS_TO_CATEGORIES = {}
for (const [category, tags] of Object.entries(CATEGORIES_TO_TAGS)) {
  for (const tag of tags) {
    TAGS_TO_CATEGORIES[tag] ??= []
    TAGS_TO_CATEGORIES[tag].push(category)
  }
}

function buildNearbyQuery(latitude, longitude, radius, categories = ['any']) {
  let query = QUERY_HEADER

  if (categories.includes('any') || categories.length === 0) {
    categories = [...CATEGORIES].filter((cat) => cat !== 'any')
  }

  for (const category of categories) {
    if (!(category in CATEGORIES_TO_TAGS)) {
      throw new Error(`Unknown category: ${category}`)
    }

    for (const tag of CATEGORIES_TO_TAGS[category]) {
      query += `nwr[${tag}]["name"](around:${radius},${latitude},${longitude});`
    }
  }

  query += QUERY_FOOTER
  return query
}

function buildPlacesQuery(ids) {
  let query = QUERY_HEADER

  for (const id of ids) {
    const [type, osmId] = id.split('/')
    switch (type) {
      case 'node':
        query += `node(id:${osmId});`
        break
      case 'way':
        query += `way(id:${osmId});`
        break
      case 'relation':
        query += `relation(id:${osmId});`
        break
      default:
        throw new Error(`Unknown OSM type: ${type}`)
    }
  }

  query += QUERY_FOOTER
  return query
}

function parseOsmData(elements) {
  return elements.map((el) => {
    const tags = el.tags || {}
    const name = tags['name:en'] || tags['name'] || 'Unknown'

    const opening_hours = tags['opening_hours'] || null
    const description = tags['description:en'] || tags['description'] || null

    const categories = new Set()
    for (const [key, value] of Object.entries(tags)) {
      const tag = `${key}=${value}`
      if (TAGS_TO_CATEGORIES[tag]) {
        TAGS_TO_CATEGORIES[tag].forEach((cat) => categories.add(cat))
      }
    }

    const latitude = el.lat ?? el.center?.lat
    const longitude = el.lon ?? el.center?.lon

    return {
      id: `${el.type}/${el.id}`,
      name,
      categories: Array.from(categories),
      latitude,
      longitude,
      description,
      opening_hours,
    }
  })
}

export async function getNearbyPlaces(
  latitude,
  longitude,
  radius,
  categories = ['any']
) {
  const query = buildNearbyQuery(latitude, longitude, radius, categories)
  const response = await axios.post(URL, `data=${encodeURIComponent(query)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 20000,
  })
  return parseOsmData(response.data.elements || [])
}

export async function getPlacesByIds(ids) {
  if (!ids.length) return []
  const query = buildPlacesQuery(ids)
  const response = await axios.post(URL, `data=${encodeURIComponent(query)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 20000,
  })
  return parseOsmData(response.data.elements || [])
}

export async function getPlaceById(id) {
  const result = await getPlacesByIds([id])
  return result.length ? result[0] : null
}
