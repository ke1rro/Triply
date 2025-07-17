// components/RouteMap.jsx
import React, { useEffect, useState, useCallback } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  GeoJSON,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getDirections } from '../lib/openRouteService'

// Custom marker icons for different event types
const createCustomIcon = (color = 'blue') => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

// Function to fit the map bounds to include all markers
function MapBoundsControl({ positions }) {
  const map = useMap()

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [positions, map])

  return null
}

export default function RouteMap({ events = [] }) {
  // Convert events to locations with coordinates
  const [locations, setLocations] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 }) // Default to SF
  const [routeData, setRouteData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Process events to extract location data
  useEffect(() => {
    // Process event data and extract coordinates
    const processedLocations = events.map((event, index) => {
      // Use provided coordinates if available, or fall back to default location
      const lat =
        event.coordinates?.lat || mapCenter.lat + (Math.random() - 0.5) * 0.05
      const lng =
        event.coordinates?.lng || mapCenter.lng + (Math.random() - 0.5) * 0.05

      // Determine marker color based on event day
      let color = 'blue'
      if (event.id.startsWith('1-')) color = 'green'
      if (event.id.startsWith('2-')) color = 'orange'
      if (event.id.startsWith('3-')) color = 'red'

      return {
        id: event.id,
        name: event.name,
        time: event.time,
        day: event.id.split('-')[0],
        position: [lat, lng],
        icon: createCustomIcon(color),
        // OpenRouteService needs [longitude, latitude] format
        orsPosition: [lng, lat],
      }
    })

    setLocations(processedLocations)
  }, [events, mapCenter])

  // Fetch routes from OpenRouteService when locations change
  useEffect(() => {
    const fetchRoutes = async () => {
      if (locations.length < 2) return

      // Group locations by day
      const locationsByDay = locations.reduce((groups, loc) => {
        const day = loc.day
        if (!groups[day]) groups[day] = []
        groups[day].push(loc)
        return groups
      }, {})

      setLoading(true)
      setError(null)

      try {
        const routeResults = {}

        // Get route for each day
        for (const day of Object.keys(locationsByDay)) {
          const dayLocations = locationsByDay[day].sort((a, b) => {
            return a.id.localeCompare(b.id)
          })

          if (dayLocations.length >= 2) {
            const coordinates = dayLocations.map((loc) => loc.orsPosition)

            try {
              // Get directions from OpenRouteService
              const response = await getDirections(coordinates)
              routeResults[day] = {
                data: response,
                color:
                  day === '1' ? '#22c55e' : day === '2' ? '#f97316' : '#ef4444',
              }
            } catch (err) {
              console.warn(`Failed to get route for day ${day}:`, err)

              // Check if this is an API key error
              if (err.message && err.message.includes('API key')) {
                // For API key errors, just throw to the outer catch block
                throw err
              }

              // For other errors, fallback to direct lines
              routeResults[day] = {
                positions: dayLocations.map((loc) => loc.position),
                color:
                  day === '1' ? '#22c55e' : day === '2' ? '#f97316' : '#ef4444',
              }
            }
          }
        }

        setRouteData(routeResults)
      } catch (err) {
        console.error('Error fetching routes:', err)
        // Show specific message for API key errors
        if (err.message && err.message.includes('API key')) {
          setError(
            'OpenRouteService API key is required for route planning. The app will use direct lines instead.'
          )
        } else {
          setError(
            'Failed to load routes from OpenRouteService. Using direct lines instead.'
          )
        }

        // When there's an error, use the fallback method with direct lines
        const fallbackRoutes = {}
        Object.keys(locationsByDay).forEach((day) => {
          const dayLocations = locationsByDay[day].sort((a, b) =>
            a.id.localeCompare(b.id)
          )
          if (dayLocations.length >= 2) {
            fallbackRoutes[day] = {
              positions: dayLocations.map((loc) => loc.position),
              color:
                day === '1' ? '#22c55e' : day === '2' ? '#f97316' : '#ef4444',
            }
          }
        })

        setRouteData(fallbackRoutes)
      } finally {
        setLoading(false)
      }
    }

    fetchRoutes()
  }, [locations])

  // Get positions for the polyline (route) - fallback if API fails
  const positions = locations.map((loc) => loc.position)

  // Group locations by day for different colored routes
  const locationsByDay = locations.reduce((groups, loc) => {
    const day = loc.day
    if (!groups[day]) groups[day] = []
    groups[day].push(loc)
    return groups
  }, {})

  // Create polylines for each day's route (fallback method)
  const routesByDay = Object.keys(locationsByDay).map((day) => {
    const dayLocations = locationsByDay[day].sort((a, b) => {
      return a.id.localeCompare(b.id)
    })
    const positions = dayLocations.map((loc) => loc.position)

    // Different colors for different days
    let color = '#3388ff'
    if (day === '1') color = '#22c55e' // Green
    if (day === '2') color = '#f97316' // Orange
    if (day === '3') color = '#ef4444' // Red

    return {
      day,
      positions,
      color,
    }
  })

  return (
    <div className="route-map-container mb-10 mt-8 overflow-hidden rounded-xl border border-gray-300/30 shadow-lg transition-all duration-300 hover:shadow-2xl">
      <h3 className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 p-3 text-center text-xl font-bold text-white backdrop-blur-sm">
        Trip Route Map
      </h3>

      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-[400px] w-full bg-blue-100/10 backdrop-blur-sm md:h-[500px]"
        style={{ zIndex: 10 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap | Routes by OpenRouteService"
          className="map-tiles"
        />

        {/* Show loading state */}
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="rounded-lg bg-white/90 p-3 text-center shadow-lg">
              <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="font-medium text-gray-800">Loading routes...</p>
            </div>
          </div>
        )}

        {/* Draw OpenRouteService routes if available */}
        {!loading &&
          Object.entries(routeData).map(([day, route]) =>
            route.data ? (
              <GeoJSON
                key={`route-${day}`}
                data={route.data}
                style={() => ({
                  color: route.color,
                  weight: 5,
                  opacity: 0.8,
                })}
              />
            ) : (
              // Fallback to direct polyline if no GeoJSON data
              <Polyline
                key={`route-${day}`}
                positions={route.positions}
                color={route.color}
                weight={4}
                opacity={0.7}
                dashArray={day === '1' ? '' : '5, 10'}
              />
            )
          )}

        {/* Fallback to simple polylines if no route data at all */}
        {!loading &&
          Object.keys(routeData).length === 0 &&
          routesByDay.map((route) => (
            <Polyline
              key={`route-${route.day}`}
              positions={route.positions}
              color={route.color}
              weight={4}
              opacity={0.7}
              dashArray={route.day === '1' ? '' : '5, 10'}
            />
          ))}

        {/* Add markers for each location */}
        {locations.map((loc) => (
          <Marker key={loc.id} position={loc.position} icon={loc.icon}>
            <Popup>
              <div className="text-center">
                <h4 className="font-bold">{loc.name}</h4>
                <p className="text-sm">{loc.time}</p>
                <p className="text-xs font-semibold text-blue-600">
                  Day {loc.day}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Adjust map bounds to include all markers */}
        {positions.length > 0 && <MapBoundsControl positions={positions} />}
      </MapContainer>

      {/* Legend for the map */}
      <div className="legend flex flex-wrap justify-center gap-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 p-4 backdrop-blur-sm">
        {Object.entries(routeData).length > 0
          ? Object.entries(routeData).map(([day, route]) => (
              <div
                key={`legend-${day}`}
                className="flex items-center rounded-full bg-white/10 px-4 py-1 shadow-lg transition-transform duration-300 hover:scale-105"
              >
                <div
                  className="mr-2 h-3 w-8"
                  style={{
                    backgroundColor: route.color,
                    borderRadius: '2px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 0 5px rgba(255,255,255,0.2)',
                  }}
                ></div>
                <span className="text-sm font-medium text-white">
                  Day {day}
                </span>
              </div>
            ))
          : routesByDay.map((route) => (
              <div
                key={`legend-${route.day}`}
                className="flex items-center rounded-full bg-white/10 px-4 py-1 shadow-lg transition-transform duration-300 hover:scale-105"
              >
                <div
                  className="mr-2 h-3 w-8"
                  style={{
                    backgroundColor: route.color,
                    borderRadius: '2px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 0 5px rgba(255,255,255,0.2)',
                  }}
                ></div>
                <span className="text-sm font-medium text-white">
                  Day {route.day}
                </span>
              </div>
            ))}
      </div>

      <div className="flex flex-wrap items-center justify-between bg-black/40 text-center text-xs">
        <div className="w-full p-2 text-gray-300/80 sm:w-auto">
          Tip: Click on markers to see event details
        </div>
        {!loading && !error && Object.keys(routeData).length > 0 && (
          <div className="flex w-full items-center justify-center p-2 text-blue-300/80 sm:w-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Routes powered by OpenRouteService
          </div>
        )}
        {error && (
          <div className="flex w-full items-center justify-center p-2 text-yellow-300/80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {error.includes('API key') ? (
              <>
                <span>API key needed for routes. </span>
                <a
                  href="https://openrouteservice.org/dev/#/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-300 underline hover:text-blue-200"
                >
                  Get free key
                </a>
              </>
            ) : (
              error
            )}
          </div>
        )}
      </div>
    </div>
  )
}
