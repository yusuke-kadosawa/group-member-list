"use client"
import { useState } from "react"
import PlacesMap from "./PlacesMap"
import PlaceList from "./PlaceList"
import type { PlacesMapPlace } from "./PlacesMap"

type Props = {
  places: PlacesMapPlace[]
}

export default function PlacesSection({ places }: Props) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2 rounded-lg overflow-hidden shadow shrink-0">
        <PlacesMap places={places} hoveredId={hoveredId} onHover={setHoveredId} />
      </div>
      <div className="md:w-1/2 min-w-0">
        <PlaceList places={places} hoveredId={hoveredId} onHover={setHoveredId} />
      </div>
    </div>
  )
}
