import React from 'react'
import TravelCard from '../components/TravelCard'
import TravelModalWithCopy from '../components/TravelModalWithCopy'

export default function HomeTripList({ trips, onLike }) {
  return (
    <div className="flex w-full flex-col items-center space-y-6">
      {trips.map((travel) => (
        <div key={travel.id} className="w-full max-w-md">
          <TravelCard
            trip={travel}
            ModalComponent={TravelModalWithCopy}
            onLike={onLike}
          />
        </div>
      ))}
    </div>
  )
}

