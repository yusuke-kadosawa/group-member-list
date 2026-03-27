"use client"
import dynamic from "next/dynamic"
import React from "react"

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

export type PlacesMapPlace = {
  id: number
  name: string
  latitude: number | null
  longitude: number | null
}

type Props = {
  places: PlacesMapPlace[]
  zoom?: number
}

const DEFAULT_ZOOM = 15
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const FALLBACK_CENTER: [number, number] = [35.6812, 139.7671] // 東京

export default function PlacesMap({ places, zoom = DEFAULT_ZOOM }: Props) {
  const validPlaces = places.filter(
    (p): p is PlacesMapPlace & { latitude: number; longitude: number } =>
      p.latitude !== null &&
      p.longitude !== null &&
      p.latitude >= -90 && p.latitude <= 90 &&
      p.longitude >= -180 && p.longitude <= 180
  )

  const center: [number, number] =
    validPlaces.length > 0
      ? [
          validPlaces.reduce((sum, p) => sum + p.latitude, 0) / validPlaces.length,
          validPlaces.reduce((sum, p) => sum + p.longitude, 0) / validPlaces.length,
        ]
      : FALLBACK_CENTER

  if (validPlaces.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
        座標が登録された場所がないため地図を表示できません
      </div>
    )
  }

  return (
    <div style={{ width: "100%", position: "relative", aspectRatio: "1 / 1" }} aria-label="場所一覧地図">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ position: "absolute", inset: 0, height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer url={TILE_URL} />
        {validPlaces.map((place) => (
          <Marker key={place.id} position={[place.latitude, place.longitude]}>
            <Popup>
              <a href={`/places/${place.id}`} className="text-blue-600 hover:underline font-medium">
                {place.name}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
