import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import TravelCard from '../components/TravelCard';

// Example travel card data
const exampleTrip = {
  id: 'example-1',
  start: 'New York',
  end: 'Paris',
  title: 'European Adventure',
  distance: 5850,
  duration: '8h 30m',
  likes: 127,
  image: 'https://picsum.photos/400/300?random=1',
  description: 'A wonderful journey from the Big Apple to the City of Light. Experience the culture, cuisine, and history.',
  comments: [
    'Amazing flight experience!',
    'Great views over the Atlantic',
    'Perfect timing for arrival'
  ]
};

const Homepage = () => {
  const [travelData, setTravelData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTravelData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'travels'));
        const travels = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTravelData(travels);
      } catch (error) {
        console.error('Error fetching travel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelData();
  }, []);

  // Combine example trip with Firebase data
  const allTravels = [exampleTrip, ...travelData];

  const filteredTravels = allTravels.filter(travel =>
    travel.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    travel.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    travel.start?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    travel.end?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFilterClick = () => {
    // TODO: Implement filter functionality
    console.log('Filter clicked');
  };

  const handleProfileClick = () => {
    // TODO: Implement profile navigation
    console.log('Profile clicked');
  };

  const handleAddClick = () => {
    // TODO: Implement add new travel functionality
    console.log('Add travel clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <div className="text-3xl">✈️</div>
          <h1 className="text-2xl md:text-3xl font-bold m-0 font-sans">Tripply</h1>
        </div>
      </header>

      {/* Search Bar Section */}
      <div className="flex items-center gap-2 p-4 md:p-3 bg-white shadow-md">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-3 md:p-2.5 border-2 border-gray-300 rounded-full text-base outline-none transition-colors duration-300 focus:border-indigo-500"
          />
          <button 
            className="w-11 h-11 md:w-10 md:h-10 border-none rounded-full bg-indigo-500 text-white text-xl md:text-base cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-indigo-600 active:scale-95 touch-manipulation"
            onClick={handleFilterClick}
          >
            🔍
          </button>
        </div>
        <button 
          className="w-11 h-11 md:w-10 md:h-10 border-none rounded-full bg-indigo-500 text-white text-xl md:text-base cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-indigo-600 active:scale-95 touch-manipulation"
          onClick={handleProfileClick}
        >
          👤
        </button>
      </div>

      {/* Travel Cards */}
      <main className="p-4 md:p-3">
        {loading ? (
          <div className="text-center py-8 text-gray-600 text-base">Loading travels...</div>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            {filteredTravels.length > 0 ? (
              filteredTravels.map(travel => (
                <TravelCard key={travel.id} trip={travel} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-600 text-base">
                {searchQuery ? 'No travels found matching your search.' : 'No travels available.'}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        className="fixed bottom-5 right-5 md:bottom-4 md:right-4 w-14 h-14 md:w-13 md:h-13 rounded-2xl border-none bg-indigo-500 text-white text-3xl md:text-2xl font-bold cursor-pointer shadow-lg transition-all duration-300 z-50 hover:bg-indigo-600 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95 touch-manipulation"
        onClick={handleAddClick}
        style={{ 
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        }}
      >
        +
      </button>
    </div>
  );
};

export default Homepage;
