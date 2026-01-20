export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container-app py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="mt-2 h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="mt-2 h-3 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
