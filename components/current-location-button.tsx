"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from "lucide-react"

interface CurrentLocationButtonProps {
  onLocationFound: (lat: number, lng: number, address: string) => void
}

export default function CurrentLocationButton({ onLocationFound }: CurrentLocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setIsLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // Reverse geocode to get address
        if (window.google) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            setIsLoading(false)
            if (status === "OK" && results[0]) {
              onLocationFound(lat, lng, results[0].formatted_address)
            } else {
              onLocationFound(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
            }
          })
        } else {
          setIsLoading(false)
          onLocationFound(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        }
      },
      (error) => {
        setIsLoading(false)
        console.error("Geolocation error:", error)
        alert("Unable to get your location. Please ensure location services are enabled.")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={getCurrentLocation}
      disabled={isLoading}
      className="mt-2"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
      {isLoading ? "Getting Location..." : "Use Current Location"}
    </Button>
  )
}
