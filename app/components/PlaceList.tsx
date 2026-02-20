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
    <>
      {places.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-400">
            まだ場所が登録されていません。<br />
            新規作成してください。
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  場所名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  緯度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  経度
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {places.map((place) => (
                <tr key={place.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/places/${place.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      {place.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {place.latitude !== null ? place.latitude.toFixed(6) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {place.longitude !== null ? place.longitude.toFixed(6) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/places/${place.id}/edit`}
                      className="text-blue-600 dark:text-blue-400 hover:underline mr-4"
                    >
                      編集
                    </Link>
                    <Link
                      href={`/places/${place.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
