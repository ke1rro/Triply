// components/MapPicker.jsx
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Delete previous icon setup
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
})

function LocationMarker({ onSelect, customLocationName, notes }) {
  const [position, setPosition] = useState(null)

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      const locationName =
        customLocationName ||
        `Custom Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`
      onSelect({
        id: 'custom-marker',
        name: locationName,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        categories: ['custom'],
        isCustom: true,
        notes: notes || '',
      })
    },
  })

  return position ? <Marker position={position} /> : null
}

export default function MapPicker({ onSelect, selectedPlace }) {
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 }) // Default to SF
  const [customLocationName, setCustomLocationName] = useState('')
  const [notes, setNotes] = useState('')

  // Update form fields when selectedPlace changes
  useEffect(() => {
    if (selectedPlace) {
      // Don't override custom name if it contains the default "Custom Location" pattern
      if (
        !selectedPlace.name.includes('Custom Location (') ||
        customLocationName === ''
      ) {
        setCustomLocationName(selectedPlace.name || '')
      }
      setNotes(selectedPlace.notes || '')
    }
  }, [selectedPlace])

  const handleLocationNameChange = (e) => {
    setCustomLocationName(e.target.value)

    if (selectedPlace) {
      const updatedPlace = {
        ...selectedPlace,
        name:
          e.target.value ||
          `Custom Location (${selectedPlace.latitude.toFixed(4)}, ${selectedPlace.longitude.toFixed(4)})`,
        notes: notes,
      }
      onSelect(updatedPlace)
    }
  }

  const handleNotesChange = (e) => {
    setNotes(e.target.value)

    if (selectedPlace) {
      const updatedPlace = {
        ...selectedPlace,
        notes: e.target.value,
        name: customLocationName || selectedPlace.name,
      }
      onSelect(updatedPlace)
    }
  }

  return (
    <div>
      <div className="mb-3">
        <p className="mb-2 text-sm font-medium text-white">
          Click anywhere on the map to place a pin at your desired location.
        </p>

        <div className="mb-2">
          <label className="mb-1 block text-sm font-medium text-white">
            Location Name (Optional)
          </label>
          <input
            type="text"
            value={customLocationName}
            onChange={handleLocationNameChange}
            placeholder="e.g., Central Park"
            className="w-full rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-white">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Optional"
            rows="2"
            className="w-full rounded-lg border border-gray-300/30 bg-white/10 px-4 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
        </div>

        {selectedPlace && (
          <div className="mt-2 border-t border-gray-500/30 pt-2">
            <p className="text-xs text-gray-300">
              Coordinates: {selectedPlace.latitude.toFixed(4)},{' '}
              {selectedPlace.longitude.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      <MapContainer
        center={mapCenter}
        zoom={14}
        className="h-64 w-full rounded"
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
        <LocationMarker
          onSelect={onSelect}
          customLocationName={customLocationName}
          notes={notes}
        />
      </MapContainer>
    </div>
  )
}
