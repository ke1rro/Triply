import { useState } from "react";
import TravelModal from "./TravelModal.jsx";

export default function TravelCard({ trip }) {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition w-80"
      >
        {/* Title at the top */}
        <div className="p-4 pb-2">
          <h2 className="text-xl font-semibold text-left">
            {trip.title || `${trip.start} → ${trip.end}`}
          </h2>
        </div>

        {/* Horizontal layout for image and info */}
        <div className="flex px-4 pb-4 gap-3">
          {/* Image on the left */}
          <div className="flex-shrink-0">
            {!imageError ? (
              <img
                src={trip.image}
                alt={trip.title}
                className="w-24 h-20 object-cover rounded-lg"
                onError={handleImageError}
              />
            ) : (
              <div className="w-24 h-20 bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center rounded-lg">
                <span className="text-white text-lg">🏞️</span>
              </div>
            )}
          </div>

          {/* Info on the right */}
          <div className="flex-1 space-y-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">
              {trip.start} → {trip.end}
            </p>
            <p className="text-sm text-gray-600">
              {trip.distance} km • {trip.duration}
            </p>
            <p className="text-sm text-gray-500">❤️ {trip.likes} likes</p>
          </div>
        </div>
      </div>

      {showModal && <TravelModal trip={trip} onClose={() => setShowModal(false)} />}
    </>
  );
}
