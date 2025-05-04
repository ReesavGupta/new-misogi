import { NavLink } from 'react-router-dom'
import { Home, BarChart2, Settings } from 'lucide-react'

const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 z-10 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          HabitVault
        </h1>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`
            }
          >
            <Home
              className="mr-3 h-5 w-5"
              aria-hidden="true"
            />
            Dashboard
          </NavLink>
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`
            }
          >
            <BarChart2
              className="mr-3 h-5 w-5"
              aria-hidden="true"
            />
            Statistics
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`
            }
          >
            <Settings
              className="mr-3 h-5 w-5"
              aria-hidden="true"
            />
            Settings
          </NavLink>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
