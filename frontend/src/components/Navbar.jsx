import { useNavigate, useLocation } from 'react-router-dom'
import {
  FiUser,
  FiNavigation,
  FiHome,
  FiPlus,
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
  const handleMyTripsClick = () => {
    navigate('/mytrips')
  }

  const handleBackClick = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <>
      {/* Header Navigation */}
      {showHeaderNav && (
        <div className="fixed left-0 right-0 top-0 z-20 p-4">
          <div className="flex items-center justify-between">
            <FiArrowLeft
              className="h-8 w-8 cursor-pointer text-white drop-shadow-sm transition-all duration-300 hover:scale-110 hover:text-blue-400 active:scale-95"
              onClick={handleBackClick}
            />
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              {headerTitle}
            </h1>
            <div className="h-8 w-8"></div> {/* Spacer for centering */}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="bg-black/50 backdrop-blur-lg">
            <div className="safe-area-bottom px-4 py-2">
              <div className="flex items-center justify-around">
                {/* Home */}
                <FiHome
                  onClick={handleHomeClick}
                  className={`h-7 w-7 cursor-pointer transition-colors duration-300 ${
                    activeTab === 'home'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                />

                {/* My Trips */}
                <FiNavigation
                  onClick={handleMyTripsClick}
                  className={`h-7 w-7 cursor-pointer transition-colors duration-300 ${
                    activeTab === 'mytrips'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                />

                {/* Add Trip */}
                <FiPlus
                  onClick={onAddClick}
                  className="h-8 w-8 cursor-pointer text-white transition-transform duration-300 active:scale-95"
                />

                {/* Profile */}
                <FiUser
                  onClick={handleProfileClick}
                  className={`h-7 w-7 cursor-pointer transition-colors duration-300 ${
                    activeTab === 'profile'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
