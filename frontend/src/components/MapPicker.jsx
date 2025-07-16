// components/LocationPickerMap.jsx
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getNearbyPlaces } from '../lib/places'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
})

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null)

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onSelect(null) // reset if custom point
    },
  })

  return position ? <Marker position={position} /> : null
}

export default function LocationPickerMap({ onSelect, selectedPlace }) {
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 }) // Default to SF
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true)
      const results = await getNearbyPlaces(mapCenter.lat, mapCenter.lng, 1000)
      setPlaces(results)
      setLoading(false)
    }
    fetchPlaces()
  }, [mapCenter])

  return (
    <div>
      <MapContainer
        center={mapCenter}
        zoom={14}
        className="mb-3 h-64 w-full rounded"
        whenCreated={(map) => {
          map.locate({ setView: true, maxZoom: 14 })
          map.on('moveend', () => {
            const center = map.getCenter()
            setMapCenter({ lat: center.lat, lng: center.lng })
          })
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            eventHandlers={{
              click: () => onSelect(place),
            }}
          />
        ))}
        <LocationMarker onSelect={onSelect} />
      </MapContainer>

      {loading && (
        <p className="text-sm text-gray-500">Loading nearby places...</p>
      )}
      <ul className="max-h-32 overflow-y-auto text-sm">
        {places.map((place) => (
          <li
            key={place.id}
            className={`cursor-pointer rounded p-2 hover:bg-gray-100 ${
              selectedPlace?.id === place.id ? 'bg-indigo-100 font-medium' : ''
            }`}
            onClick={() => onSelect(place)}
          >
            {place.name} ({place.categories.join(', ')})
          </li>
        ))}
      </ul>
    </div>
  )
}
