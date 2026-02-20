"use client"
import Link from 'next/link'

type PlaceListProps = {
  places: Array<{
    id: number
    name: string
    latitude: number | null
    longitude: number | null
  }>
}

export default function PlaceList({ places }: PlaceListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          場所一覧
        </h2>
        <Link
          href="/places/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          新規作成
        </Link>
      </div>

      {places.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          場所が登録されていません
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => (
            <Link
              key={place.id}
              href={`/places/${place.id}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {place.name}
              </h3>
              {(place.latitude !== null || place.longitude !== null) && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {place.latitude !== null && (
                    <div>緯度: {place.latitude.toFixed(6)}</div>
                  )}
                  {place.longitude !== null && (
                    <div>経度: {place.longitude.toFixed(6)}</div>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
