export default function DashboardLoading() {
  return (
    <div className="p-6 animate-pulse">
      {/* header skeleton */}
      <div className="mb-6">
        <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded-lg w-40 mb-2" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800/60 rounded w-64" />
      </div>

      {/* content rows skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 dark:bg-gray-800/60 rounded-xl"
            style={{ opacity: 1 - i * 0.12 }}
          />
        ))}
      </div>
    </div>
  )
}
