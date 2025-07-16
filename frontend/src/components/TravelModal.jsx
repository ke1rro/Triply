import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function TravelModal({ trip, onClose }) {
  const navigate = useNavigate()

  useEffect(() => {
    // Immediately navigate to trip page and close modal
    navigate(`/tripview/${trip.dataName}`)
    onClose()
  }, [trip.dataName, navigate, onClose])

  // Return null since we're navigating away
  return null
}
