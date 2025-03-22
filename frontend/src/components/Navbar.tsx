import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm rounded-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-indigo-600">Be~Fluent</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link to="/courses" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                Courses
              </Link>
              <Link to="/students" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                Students
              </Link>
              <Link to="/teachers" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                Teachers
              </Link>
              <Link to="/schedule" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                Schedule
              </Link>
              <Link to="/reports" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                Reports
              </Link>
            </div>
          </div>

          {/* Profile and notifications */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <button className="rounded-full bg-gray-100 p-2 text-gray-600 hover:text-indigo-600">
                <span className="sr-only">Notifications</span>
                <div className="h-6 w-6">🔔</div>
              </button>
              <button className="flex items-center space-x-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                <span>Profile</span>
                <div className="h-6 w-6 rounded-full bg-gray-300">👤</div>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link to="/courses" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600">
              Courses
            </Link>
            <Link to="/students" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600">
              Students
            </Link>
            <Link to="/teachers" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600">
              Teachers
            </Link>
            <Link to="/schedule" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600">
              Schedule
            </Link>
            <Link to="/reports" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600">
              Reports
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar


