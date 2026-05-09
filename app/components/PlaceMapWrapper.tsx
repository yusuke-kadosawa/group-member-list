"use client"
import React from "react"
import PlaceMap from "@/components/PlaceMap"

export type PlaceMapWrapperProps = {
  latitude: number
  longitude: number
  placeName?: string
}

export default function PlaceMapWrapper({ latitude, longitude, placeName }: PlaceMapWrapperProps) {
  return <PlaceMap latitude={latitude} longitude={longitude} placeName={placeName} />
}
