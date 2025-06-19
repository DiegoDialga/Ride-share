"use client"

import { useEffect, useRef, useState } from "react"
import type { GoogleMapsDriver, GoogleMapsRideRequest, RouteInfo } from "../types/google-maps"

interface GoogleMapProps {
  drivers: Map<string, GoogleMapsDriver>
  rideRequests: GoogleMapsRideRequest[]
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  selectedRoute?: RouteInfo | null
  mapCenter?: { lat: number; lng: number }
}

const GOOGLE_MAPS_API_KEY = "AIzaSyCn5DJXcdsGFa5bEGLmF4t8RQIInp9CpUA"

export default function GoogleMap({
  drivers,
  rideRequests,
  onLocationSelect,
  selectedRoute,
  mapCenter = { lat: 28.6139, lng: 77.209 }, // New Delhi default
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const directionsServiceRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
        },
        (error) => {
          console.log("Geolocation error:", error)
          // Fallback to Delhi if geolocation fails
        },
      )
    }
  }, [])

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
    script.async = true
    script.defer = true

    script.onload = () => {
      setIsLoaded(true)
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    const initialCenter = userLocation || mapCenter

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    })

    // Add user location marker if available
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        title: "Your Location",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2"/>
              <text x="16" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">📍</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      })
    }

    directionsServiceRef.current = new window.google.maps.DirectionsService()
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#EF4444",
        strokeWeight: 6,
        strokeOpacity: 0.8,
      },
    })
    directionsRendererRef.current.setMap(mapInstanceRef.current)

    // Add click listener for location selection
    if (onLocationSelect) {
      mapInstanceRef.current.addListener("click", (event: any) => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()

        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            onLocationSelect(lat, lng, results[0].formatted_address)
          } else {
            onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          }
        })
      })
    }
  }, [isLoaded, mapCenter, userLocation, onLocationSelect])

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current.clear()

    // Add driver markers
    drivers.forEach((driver) => {
      const marker = new window.google.maps.Marker({
        position: { lat: driver.lat, lng: driver.lng },
        map: mapInstanceRef.current,
        title: `${driver.name} (${driver.rating}★)`,
        icon: {
          url: driver.available
            ? "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                  <text x="16" y="20" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">🚗</text>
                </svg>
              `)
            : "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#EF4444" stroke="#DC2626" strokeWidth="2"/>
                  <text x="16" y="20" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">🚗</text>
                </svg>
              `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${driver.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              Rating: ${driver.rating}★<br/>
              Status: ${driver.available ? "Available" : "Busy"}
            </p>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current, marker)
      })

      markersRef.current.set(`driver-${driver.id}`, marker)
    })

    // Add ride request markers
    rideRequests.forEach((request) => {
      if (request.status === "completed") return

      // Pickup marker
      const pickupMarker = new window.google.maps.Marker({
        position: { lat: request.pickupLat, lng: request.pickupLng },
        map: mapInstanceRef.current,
        title: `Pickup: ${request.passengerName}`,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#10B981" stroke="#059669" strokeWidth="2"/>
              <text x="16" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">📍</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
        animation: request.status === "pending" ? window.google.maps.Animation.BOUNCE : undefined,
      })

      // Destination marker
      const destMarker = new window.google.maps.Marker({
        position: { lat: request.destinationLat, lng: request.destinationLng },
        map: mapInstanceRef.current,
        title: `Destination: ${request.passengerName}`,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#F59E0B" stroke="#D97706" strokeWidth="2"/>
              <text x="16" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">🏁</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      })

      const pickupInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Pickup Location</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              Passenger: ${request.passengerName}<br/>
              Status: ${request.status}<br/>
              Address: ${request.pickupAddress}
            </p>
          </div>
        `,
      })

      const destInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Destination</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              Passenger: ${request.passengerName}<br/>
              Address: ${request.destinationAddress}
            </p>
          </div>
        `,
      })

      pickupMarker.addListener("click", () => {
        pickupInfoWindow.open(mapInstanceRef.current, pickupMarker)
      })

      destMarker.addListener("click", () => {
        destInfoWindow.open(mapInstanceRef.current, destMarker)
      })

      markersRef.current.set(`pickup-${request.id}`, pickupMarker)
      markersRef.current.set(`dest-${request.id}`, destMarker)
    })
  }, [drivers, rideRequests, isLoaded])

  // Update route display
  useEffect(() => {
    if (!directionsRendererRef.current || !selectedRoute || !mapInstanceRef.current) return

    // Parse the route data and display it
    if (selectedRoute.directionsResult) {
      directionsRendererRef.current.setDirections(selectedRoute.directionsResult)
    }
  }, [selectedRoute])

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={mapRef} className="w-full h-[600px] rounded-lg border border-gray-300" style={{ minHeight: "600px" }} />
  )
}
