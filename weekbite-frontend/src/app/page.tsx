export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4">
      {/* Main Content */}
      <div className="text-center max-w-2xl">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 mb-2">
            WeekBite
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Plan Your Week, Bite by Bite</p>
        </div>

        {/* Coming Soon Message */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Coming Soon
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Your smart meal planning assistant is on the way. Get ready to organize your weekly meals with ease!
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">🍽️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Planning</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Plan your meals for the entire week in minutes
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">🛒</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shopping Lists</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Auto-generated shopping lists from your meal plans
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">⏱️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Time Saving</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Save hours planning meals and managing groceries
            </p>
          </div>
        </div>

        {/* Email Signup */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Be the first to know when WeekBite launches!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105">
              Notify Me
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © 2024 WeekBite. All rights reserved.
        </p>
      </div>
    </div>
  );
}
