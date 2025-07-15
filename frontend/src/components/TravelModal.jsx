import { useNavigate } from 'react-router-dom'

export default function TravelModal({ trip, onClose }) {
  const navigate = useNavigate()

  const handleSelectTrip = () => {
    navigate(`/trip/${trip.dataName}`)
  }

  const formatRating = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="float-right text-xl font-bold text-gray-500 hover:text-gray-700"
        >
          ×
        </button>

        {/* Title */}
        <h3 className="mb-4 pr-8 text-2xl font-bold text-gray-800">
          {trip.name}
        </h3>

        {/* Description */}
        <p className="mb-6 leading-relaxed text-gray-700">
          {trip.description || 'No description available.'}
        </p>

        {/* Trip Info */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Duration:</span>
            <p>
              {trip.days} day{trip.days !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Likes:</span>
            <p>❤️ {trip.likes}</p>
          </div>
        </div>

        {/* Locations */}
        {trip.locations && trip.locations.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-2 font-medium text-gray-600">Locations:</h4>
            <div className="flex flex-wrap gap-2">
              {trip.locations.map((location, index) => (
                <span
                  key={index}
                  className="rounded-md bg-indigo-100 px-2 py-1 text-sm text-indigo-700"
                >
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        {trip.comments && trip.comments.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-gray-600">Comments:</h4>
            <div className="max-h-40 space-y-3 overflow-y-auto">
              {trip.comments.map((comment, index) => (
                <div key={index} className="border-l-4 border-indigo-200 pl-3">
                  <div className="mb-1 flex items-start justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      {comment.name || 'Anonymous'}
                    </span>
                    <span className="text-sm text-yellow-500">
                      {formatRating(comment.rating || 0)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{comment.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Select Trip Button */}
        <button
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition duration-200 ease-in-out hover:bg-indigo-700"
          onClick={handleSelectTrip}
        >
          Select Trip
        </button>
      </div>
    </div>
  )
}
