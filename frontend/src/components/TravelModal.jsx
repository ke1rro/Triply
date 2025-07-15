import { useNavigate } from "react-router-dom";

export default function TripModal({ trip, onClose }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trip/${trip.id}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClick}
    >
      <div
        className="bg-white p-6 rounded-xl w-[90%] max-w-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold mb-2">{trip.start} → {trip.end}</h3>
        <p className="text-gray-700 mb-4">{trip.description}</p>

        <div className="text-sm text-gray-500">
          <strong>Comments:</strong>
          <ul className="list-disc ml-5 mt-2">
            {trip.comments.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        <button
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleClick}
        >
          Go to Trip Page
        </button>
      </div>
    </div>
  );
}

