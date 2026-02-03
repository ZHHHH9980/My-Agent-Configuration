export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">DevTools Dashboard</h1>
          <p className="text-gray-600 mt-2">Graphical management dashboard for skills and tools</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">15</span>
              </div>
            </div>
            <p className="text-gray-600 mt-2">Total skills available</p>
            <div className="mt-4">
              <span className="text-green-600 text-sm">+2 this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Tools</h3>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">3</span>
              </div>
            </div>
            <p className="text-gray-600 mt-2">Installed tools</p>
            <div className="mt-4">
              <span className="text-green-600 text-sm">+1 this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Running</h3>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-bold">1</span>
              </div>
            </div>
            <p className="text-gray-600 mt-2">Active tools</p>
            <div className="mt-4">
              <span className="text-gray-600 text-sm">Stable</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <a href="/skills" className="block">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Skills</h3>
                <p className="text-gray-600">Explore and manage your skills library</p>
              </div>
            </a>

            <a href="/tools" className="block">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Tools</h3>
                <p className="text-gray-600">Start, stop, and configure tools</p>
              </div>
            </a>

            <a href="/terminal" className="block">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Terminal</h3>
                <p className="text-gray-600">Access command line interface</p>
              </div>
            </a>

            <a href="/settings" className="block">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
                <p className="text-gray-600">Configure your dashboard</p>
              </div>
            </a>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <span className="text-gray-700">Skills System</span>
              </div>
              <span className="text-green-600 font-medium">Healthy</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <span className="text-gray-700">Tools Manager</span>
              </div>
              <span className="text-green-600 font-medium">Running</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-3"></div>
                <span className="text-gray-700">Package Updates</span>
              </div>
              <span className="text-yellow-600 font-medium">3 available</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <span className="text-gray-700">API Server</span>
              </div>
              <span className="text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="container mx-auto px-4 py-6">
          <p className="text-gray-600 text-center">
            DevTools Dashboard • My Agent Configuration • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}