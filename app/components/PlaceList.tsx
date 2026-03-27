"use client"
import Link from 'next/link'

type PlaceListProps = {
  places: Array<{
    id: number
    name: string
    latitude: number | null
    longitude: number | null
  }>
  hoveredId?: number | null
  onHover?: (id: number | null) => void
}

export default function PlaceList({ places, hoveredId, onHover }: PlaceListProps) {
  // 有効座標を持つ場所のピン番号マップ（PlacesMap と同じ順序）
  const pinNumbers = new Map<number, number>()
  let pinIndex = 0
  for (const place of places) {
    if (
      place.latitude !== null && place.longitude !== null &&
      place.latitude >= -90 && place.latitude <= 90 &&
      place.longitude >= -180 && place.longitude <= 180
    ) {
      pinIndex++
      pinNumbers.set(place.id, pinIndex)
    }
  }

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
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                  #
                </th>
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
              {places.map((place) => {
                const pinNum = pinNumbers.get(place.id)
                const isHovered = hoveredId === place.id
                return (
                  <tr
                    key={place.id}
                    className={`transition-colors ${isHovered ? "bg-orange-50 dark:bg-orange-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-900"}`}
                    onMouseEnter={() => onHover?.(place.id)}
                    onMouseLeave={() => onHover?.(null)}
                  >
                    <td className="px-3 py-4 whitespace-nowrap">
                      {pinNum !== undefined ? (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white transition-colors ${isHovered ? "bg-orange-500" : "bg-blue-500"}`}
                        >
                          {pinNum}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                      )}
                    </td>
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
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
