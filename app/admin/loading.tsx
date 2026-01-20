export default function AdminLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="mt-2 h-4 w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
              <div className="ml-4">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="mt-2 h-6 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-3" />
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
