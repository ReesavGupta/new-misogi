import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">
        404
      </h1>
      <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
        Page not found
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 btn btn-primary"
      >
        Go back home
      </Link>
    </div>
  )
}

export default NotFound
