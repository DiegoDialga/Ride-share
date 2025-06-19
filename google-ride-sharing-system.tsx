"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import GoogleMap from "./components/google-map"
import GoogleRideRequestForm from "./components/google-ride-request-form"
import GoogleDriverPanel from "./components/google-driver-panel"
import GoogleRideStatus from "./components/google-ride-status"
import { matchDriverToRide, calculateRoute } from "./utils/google-maps-algorithms"
import type { GoogleMapsDriver, GoogleMapsRideRequest, RouteInfo } from "./types/google-maps"

export default function GoogleRideSharingSystem() {
  const [drivers, setDrivers] = useState<Map<string, GoogleMapsDriver>>(() => {
    const driverMap = new Map()
    // Delhi area drivers with Indian names
    const initialDrivers: GoogleMapsDriver[] = [
      { id: "driver1", name: "Rajesh Kumar", lat: 28.6239, lng: 77.209, available: true, rating: 4.8 },
      { id: "driver2", name: "Priya Sharma", lat: 28.6139, lng: 77.229, available: true, rating: 4.6 },
      { id: "driver3", name: "Amit Singh", lat: 28.6039, lng: 77.199, available: true, rating: 4.9 },
      { id: "driver4", name: "Sunita Gupta", lat: 28.6339, lng: 77.219, available: false, rating: 4.7 },
      { id: "driver5", name: "Vikram Patel", lat: 28.5939, lng: 77.239, available: true, rating: 4.5 },
      { id: "driver6", name: "Meera Joshi", lat: 28.6439, lng: 77.189, available: true, rating: 4.8 },
      { id: "driver7", name: "Ravi Agarwal", lat: 28.5839, lng: 77.249, available: true, rating: 4.4 },
      { id: "driver8", name: "Kavita Reddy", lat: 28.6539, lng: 77.179, available: false, rating: 4.9 },
    ]

    initialDrivers.forEach((driver) => driverMap.set(driver.id, driver))
    return driverMap
  })

  const [rideRequests, setRideRequests] = useState<GoogleMapsRideRequest[]>([])
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.209 }) // New Delhi

  const handleRideRequest = useCallback(
    async (requestData: Omit<GoogleMapsRideRequest, "id" | "timestamp" | "status">) => {
      const newRequest: GoogleMapsRideRequest = {
        ...requestData,
        id: `ride_${Date.now()}`,
        timestamp: Date.now(),
        status: "pending",
      }

      setRideRequests((prev) => [...prev, newRequest])

      // Center map on pickup location
      setMapCenter({ lat: newRequest.pickupLat, lng: newRequest.pickupLng })

      // Find and assign nearest available driver
      setTimeout(async () => {
        const matchedDriverId = matchDriverToRide(newRequest, drivers)

        if (matchedDriverId) {
          const driver = drivers.get(matchedDriverId)!

          // Calculate route from driver to pickup, then to destination
          const driverToPickupRoute = await calculateRoute(
            driver.lat,
            driver.lng,
            newRequest.pickupLat,
            newRequest.pickupLng,
          )

          const pickupToDestRoute = await calculateRoute(
            newRequest.pickupLat,
            newRequest.pickupLng,
            newRequest.destinationLat,
            newRequest.destinationLng,
          )

          // Update request status and assign driver
          setRideRequests((prev) =>
            prev.map((req) =>
              req.id === newRequest.id ? { ...req, status: "matched", assignedDriverId: matchedDriverId } : req,
            ),
          )

          // Mark driver as unavailable
          setDrivers((prev) => {
            const newDrivers = new Map(prev)
            const updatedDriver = newDrivers.get(matchedDriverId)!
            newDrivers.set(matchedDriverId, { ...updatedDriver, available: false })
            return newDrivers
          })

          // Simulate ride progress
          setTimeout(() => {
            setRideRequests((prev) =>
              prev.map((req) => (req.id === newRequest.id ? { ...req, status: "in-progress" } : req)),
            )
          }, 3000)
        }
      }, 1500)
    },
    [drivers],
  )

  const handleToggleDriverAvailability = useCallback((driverId: string) => {
    setDrivers((prev) => {
      const newDrivers = new Map(prev)
      const driver = newDrivers.get(driverId)!
      newDrivers.set(driverId, { ...driver, available: !driver.available })
      return newDrivers
    })
  }, [])

  const handleCancelRide = useCallback(
    (rideId: string) => {
      const ride = rideRequests.find((r) => r.id === rideId)
      if (ride?.assignedDriverId) {
        // Make driver available again
        setDrivers((prev) => {
          const newDrivers = new Map(prev)
          const driver = newDrivers.get(ride.assignedDriverId!)!
          newDrivers.set(ride.assignedDriverId!, { ...driver, available: true })
          return newDrivers
        })
      }

      setRideRequests((prev) => prev.filter((req) => req.id !== rideId))
      setSelectedRoute(null)
    },
    [rideRequests],
  )

  const handleCompleteRide = useCallback(
    (rideId: string) => {
      const ride = rideRequests.find((r) => r.id === rideId)
      if (ride?.assignedDriverId) {
        // Move driver to destination and make available
        setDrivers((prev) => {
          const newDrivers = new Map(prev)
          const driver = newDrivers.get(ride.assignedDriverId!)!
          newDrivers.set(ride.assignedDriverId!, {
            ...driver,
            available: true,
            lat: ride.destinationLat,
            lng: ride.destinationLng,
          })
          return newDrivers
        })
      }

      setRideRequests((prev) => prev.map((req) => (req.id === rideId ? { ...req, status: "completed" } : req)))
    },
    [rideRequests],
  )

  const handleShowRoute = useCallback(
    async (rideId: string) => {
      const ride = rideRequests.find((r) => r.id === rideId)
      if (!ride) return

      console.log("Calculating route for ride:", ride.id)
      console.log("From:", ride.pickupLat, ride.pickupLng)
      console.log("To:", ride.destinationLat, ride.destinationLng)

      const route = await calculateRoute(ride.pickupLat, ride.pickupLng, ride.destinationLat, ride.destinationLng)

      if (route) {
        console.log("Route calculated:", route)
        setSelectedRoute(route)
        // Center map between pickup and destination
        const centerLat = (ride.pickupLat + ride.destinationLat) / 2
        const centerLng = (ride.pickupLng + ride.destinationLng) / 2
        setMapCenter({ lat: centerLat, lng: centerLng })
      } else {
        console.error("Failed to calculate route")
        alert("Unable to calculate route. Please try again.")
      }
    },
    [rideRequests],
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🗺️ Google Maps Ride-Sharing System
              <Badge variant="outline">Real-World Integration</Badge>
            </CardTitle>
            <CardDescription>
              Advanced ride-sharing system for India powered by Google Maps API with real-time routing, driver matching
              algorithms, and interactive location search. Features live tracking, geolocation, and optimized driver
              assignment across Indian cities.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Google Maps */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Map & Real-Time Tracking</CardTitle>
                <CardDescription>
                  Interactive Google Maps with live driver locations, ride requests, and route optimization. Click on
                  markers for detailed information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoogleMap
                  drivers={drivers}
                  rideRequests={rideRequests.filter((r) => r.status !== "completed")}
                  selectedRoute={selectedRoute}
                  mapCenter={mapCenter}
                />
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>Available Driver</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>Busy Driver</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    <span>Pickup Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span>Destination</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <GoogleRideRequestForm onSubmitRequest={handleRideRequest} />

            <GoogleDriverPanel
              drivers={drivers}
              rideRequests={rideRequests}
              onToggleAvailability={handleToggleDriverAvailability}
            />
          </div>
        </div>

        {/* Ride Status */}
        <GoogleRideStatus
          rideRequests={rideRequests}
          drivers={drivers}
          onCancelRide={handleCancelRide}
          onCompleteRide={handleCompleteRide}
          onShowRoute={handleShowRoute}
        />

        {/* Algorithm Info */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Algorithms & Google Maps Integration</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Google Directions API</h3>
              <p className="text-sm text-gray-600">
                Real-time route calculation with traffic data, providing accurate travel times and optimal paths between
                any two points.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Haversine Distance</h3>
              <p className="text-sm text-gray-600">
                Calculates precise distances between geographic coordinates, enabling efficient driver-passenger
                matching within specified radius.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Smart Driver Matching</h3>
              <p className="text-sm text-gray-600">
                Multi-criteria algorithm considering distance, driver rating, and availability to optimize
                passenger-driver assignments.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Google Maps Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">🇮🇳 India-Focused</h4>
              <p className="text-sm text-blue-700 mt-1">Optimized for Indian addresses and locations</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">📍 Geolocation</h4>
              <p className="text-sm text-green-700 mt-1">Auto-detect your current location</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">🛣️ Route Highlighting</h4>
              <p className="text-sm text-purple-700 mt-1">Visual route display between pickup and destination</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900">🚗 Indian Drivers</h4>
              <p className="text-sm text-orange-700 mt-1">Local driver network with Indian names and locations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
