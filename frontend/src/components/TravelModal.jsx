import { useNavigate } from 'react-router-dom'

export default function TripModal({ trip, onClose }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/trip/${trip.id}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClick}
    >
      <div
        className="w-[90%] max-w-lg rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-2xl font-bold">
          {trip.start} → {trip.end}
        </h3>
        <p className="mb-4 text-gray-700">{trip.description}</p>

        <div className="text-sm text-gray-500">
          <strong>Comments:</strong>
          <ul className="ml-5 mt-2 list-disc">
            {trip.comments.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        <button
          className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={handleClick}
        >
          Go to Trip Page
        </button>
      </div>
    </div>
  )
}
