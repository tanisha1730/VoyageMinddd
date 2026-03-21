import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import
  {
    MapPin,
    Calendar,
    Camera,
    User,
    LogOut,
    Menu,
    X,
    Home,
    Sparkles,
    Compass,
    Plane
  } from 'lucide-react'

const Layout = ( { children } ) =>
{
  const [ sidebarOpen, setSidebarOpen ] = useState( false )
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Plan Trip', href: '/planner', icon: MapPin },
    { name: 'Booking', href: '/booking', icon: Plane },
    { name: 'Recommendations', href: '/recommendations', icon: Sparkles },
    { name: 'My Itineraries', href: '/dashboard', icon: Calendar },
    { name: 'Memories', href: '/memories', icon: Camera },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const topNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Planner', href: '/planner' },
    { name: 'Booking', href: '/booking' },
    { name: 'My Trips', href: '/dashboard' },
    { name: 'Recommendations', href: '/recommendations' },
    { name: 'Memories', href: '/memories' },
  ]

  const handleLogout = async () =>
  {
    await logout()
    navigate( '/' )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Top Header */ }
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="flex h-24 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Compass className="w-8 h-8 text-gray-900" />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">VoyageMind</span>
            </Link>
            <div className="hidden md:flex items-center space-x-12">
              { topNavigation.map( ( item ) => (
                <Link
                  key={ item.name }
                  to={ item.href }
                  className={ `text-base ${ location.pathname === item.href
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                    }` }
                >
                  { item.name }
                </Link>
              ) ) }
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={ () => setSidebarOpen( !sidebarOpen ) }
                className="lg:hidden text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              { user ? (
                <Link to="/profile" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 cursor-pointer">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Sign In / Profile</span>
                </Link>
              ) : (
                <Link to="/login" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 cursor-pointer">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Sign In / Profile</span>
                </Link>
              ) }
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile sidebar */ }
      <div className={ `fixed inset-0 z-50 lg:hidden ${ sidebarOpen ? 'block' : 'hidden' }` }>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={ () => setSidebarOpen( false ) } />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Compass className="w-6 h-6 text-gray-900" />
              <span className="text-xl font-semibold text-gray-900">VoyageMind</span>
            </div>
            <button
              onClick={ () => setSidebarOpen( false ) }
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            { navigation.map( ( item ) =>
            {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={ item.name }
                  to={ item.href }
                  className={ `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${ isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }` }
                  onClick={ () => setSidebarOpen( false ) }
                >
                  <Icon className="mr-3 h-5 w-5" />
                  { item.name }
                </Link>
              )
            } ) }
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    { user?.name?.charAt( 0 ).toUpperCase() }
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{ user?.name }</p>
                <button
                  onClick={ handleLogout }
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */ }
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          { children }
        </div>
      </main>

      {/* Footer */ }
      <footer className="bg-white border-t border-gray-200 py-16">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <Compass className="w-6 h-6 text-gray-900" />
              <span className="text-xl font-bold text-gray-900">VoyageMind</span>
            </div>
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <Link to="/about" className="hover:text-gray-900">About</Link>
              <Link to="/contact" className="hover:text-gray-900">Help center</Link>
              <Link to="/terms" className="hover:text-gray-900">Terms</Link>
              <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-gray-600 hover:text-gray-900">
                <span className="sr-only">Language</span>
                🌐 English
              </button>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Plan · Book · Remember</span>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © 2025 VoyageMind. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout