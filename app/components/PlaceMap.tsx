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

export type PlaceMapProps = {
  latitude: number
  longitude: number
  zoom?: number
  height?: number | string
  ariaLabel?: string
  placeName?: string
}


const DEFAULT_ZOOM = 15
const DEFAULT_HEIGHT = 600 // 2倍に拡大
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

export default function PlaceMap({
  latitude,
  longitude,
  zoom = DEFAULT_ZOOM,
  height = DEFAULT_HEIGHT,
  ariaLabel = "地図: 場所の位置を表示",
  placeName
}: PlaceMapProps) {
  // 緯度経度バリデーション
  const isValidLat = typeof latitude === "number" && latitude >= -90 && latitude <= 90
  const isValidLng = typeof longitude === "number" && longitude >= -180 && longitude <= 180
  if (!isValidLat || !isValidLng) {
    return (
      <div className="text-red-600 dark:text-red-400" role="alert">
        地図を表示できません（座標が不正です）
      </div>
    )
  }
  // 地図本体のサイズのみ拡大、ラッパーは100%
  return (
    <div style={{ width: "100%", maxWidth: "100%" }} aria-label={ariaLabel}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom + 2}
        style={{ height: height, width: "100%", maxWidth: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer url={TILE_URL} />
        <Marker position={[latitude, longitude]}>
          {placeName && <Popup>{placeName}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  )
}
