"use client"

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"

export default function HotelsMap({ lat, lng }) {  // ✅ accept lat & lng

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  })

  if (!isLoaded) return <p>Loading map...</p>

  const center = { lat, lng }  // ✅ use the props directly

  return (
    <GoogleMap
      zoom={12}
      center={center}
      mapContainerClassName="w-full h-[400px]"  // ✅ added fixed height so map shows
    >
      <Marker position={center} />  {/* ✅ single marker for this hotel */}

    </GoogleMap>
  )
}