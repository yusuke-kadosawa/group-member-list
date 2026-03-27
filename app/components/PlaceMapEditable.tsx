"use client"
// このコンポーネントは必ず dynamic({ ssr: false }) 経由でのみ使用すること
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import React, { useEffect } from 'react'

type Props = {
  latitude: number
  longitude: number
  placeName?: string
  zoom?: number
  showMarker?: boolean
  onLocationSelect?: (lat: number, lng: number) => void
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function CenterUpdater({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap()
  useEffect(() => {
    map.panTo([latitude, longitude], { animate: true })
  }, [latitude, longitude, map])
  return null
}

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const DEFAULT_ZOOM = 15

export default function PlaceMapEditable({
  latitude,
  longitude,
  placeName,
  zoom = DEFAULT_ZOOM,
  showMarker = true,
  onLocationSelect,
}: Props) {
  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: "1 / 1",
        cursor: onLocationSelect ? "crosshair" : "default",
      }}
      aria-label="地図: クリックして位置を設定"
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        style={{ position: "absolute", inset: 0, height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer url={TILE_URL} />
        <CenterUpdater latitude={latitude} longitude={longitude} />
        {onLocationSelect && <ClickHandler onLocationSelect={onLocationSelect} />}
        {showMarker && (
          <Marker position={[latitude, longitude]}>
            {placeName && <Popup>{placeName}</Popup>}
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
