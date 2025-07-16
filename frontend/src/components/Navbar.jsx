import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FiSearch,
  FiUser,
  FiNavigation,
  FiHome,
  FiPlus,
  FiHeart,
  FiArrowLeft,
} from 'react-icons/fi'

const Navbar = ({
  activeTab = 'home',
  onAddClick,
  showBottomNav = true,
  showHeaderNav = false,
  headerTitle = '',
  onBack,
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleHomeClick = () => {
    navigate('/home')
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const handleLikesClick = () => {
    console.log('Likes clicked')
    // Add future functionality for liked trips
  }

  const handleBackClick = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/home')
    }
  }

  return (
    <>
      {/* Header Navigation */}
      {showHeaderNav && (
        <div className="mb-6 flex items-center justify-between">
          <FiArrowLeft
            className="h-8 w-8 cursor-pointer text-white drop-shadow-sm transition-all duration-300 hover:scale-110 hover:text-blue-400 active:scale-95"
            onClick={handleBackClick}
          />
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            {headerTitle}
          </h1>
          <div className="h-8 w-8"></div> {/* Spacer for centering */}
        </div>
      )}

      {/* Bottom Navigation Bar */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="border-t border-white/10 bg-black/80 backdrop-blur-lg">
            <div className="safe-area-bottom px-4 py-4">
              <div className="flex items-center justify-around">
                {/* Home */}
                <button
                  onClick={handleHomeClick}
                  className={`flex w-16 flex-col items-center gap-1 rounded-lg px-3 py-3 transition-all duration-300 ${
                    activeTab === 'home'
                      ? 'bg-blue-600/30 text-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FiHome className="h-7 w-7" />
                  <span className="text-xs font-medium">Home</span>
                </button>

                {/* Likes */}
                <button
                  onClick={handleLikesClick}
                  className={`flex w-16 flex-col items-center gap-1 rounded-lg px-3 py-3 transition-all duration-300 ${
                    activeTab === 'likes'
                      ? 'bg-rose-600/30 text-rose-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FiHeart className="h-7 w-7" />
                  <span className="text-xs font-medium">Saved</span>
                </button>

                {/* Add Trip */}
                <button
                  onClick={onAddClick}
                  className="flex w-16 flex-col items-center gap-1 rounded-lg bg-blue-600/20 px-3 py-3 text-blue-400 transition-all duration-300 hover:bg-blue-600/30 active:scale-95"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600">
                    <FiPlus className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium">Create</span>
                </button>

                {/* Profile */}
                <button
                  onClick={handleProfileClick}
                  className={`flex w-16 flex-col items-center gap-1 rounded-lg px-3 py-3 transition-all duration-300 ${
                    activeTab === 'profile'
                      ? 'bg-purple-600/30 text-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FiUser className="h-7 w-7" />
                  <span className="text-xs font-medium">Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
