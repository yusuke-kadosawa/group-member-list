"use client"
import dynamic from "next/dynamic"
import React, { useEffect, useState } from "react"
import type * as LeafletTypes from "leaflet"

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
  hoveredId?: number | null
  onHover?: (id: number | null) => void
}

function makeNumberedIcon(
  L: typeof LeafletTypes,
  num: number,
  isHovered: boolean
): LeafletTypes.DivIcon {
  const size = isHovered ? 34 : 28
  const bg = isHovered ? "#f97316" : "#3b82f6"
  const fontSize = isHovered ? 14 : 12
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${fontSize}px;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.35);line-height:1;">${num}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  })
}

const DEFAULT_ZOOM = 15
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const FALLBACK_CENTER: [number, number] = [35.6812, 139.7671] // 東京

export default function PlacesMap({ places, zoom = DEFAULT_ZOOM, hoveredId, onHover }: Props) {
  const [L, setL] = useState<typeof LeafletTypes | null>(null)

  useEffect(() => {
    import("leaflet").then((mod) => setL(mod))
  }, [])

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
        {validPlaces.map((place, index) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={L ? makeNumberedIcon(L, index + 1, hoveredId === place.id) : undefined}
            eventHandlers={{
              mouseover: () => onHover?.(place.id),
              mouseout: () => onHover?.(null),
            }}
          >
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
