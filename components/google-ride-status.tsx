"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GoogleMapsRideRequest, GoogleMapsDriver } from "../types/google-maps"

interface GoogleRideStatusProps {
  rideRequests: GoogleMapsRideRequest[]
  drivers: Map<string, GoogleMapsDriver>
  onCancelRide: (rideId: string) => void
  onCompleteRide: (rideId: string) => void
  onShowRoute: (rideId: string) => void
}

export default function GoogleRideStatus({
  rideRequests,
  drivers,
  onCancelRide,
  onCompleteRide,
  onShowRoute,
}: GoogleRideStatusProps) {
  const getDriverName = (driverId: string) => {
    return drivers.get(driverId)?.name || "Unknown Driver"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "matched":
        return "default"
      case "in-progress":
        return "outline"
      case "completed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ride Requests</CardTitle>
        <CardDescription>Current and recent ride requests with real-time tracking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rideRequests.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No ride requests yet</div>
        ) : (
          rideRequests.map((request) => {
            const distance = calculateDistance(
              request.pickupLat,
              request.pickupLng,
              request.destinationLat,
              request.destinationLng,
            )

            return (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{request.passengerName}</span>
                    <Badge variant={getStatusColor(request.status)}>{request.status}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(request.timestamp).toLocaleTimeString()}</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">From:</span>
                    <div className="text-gray-600 truncate">{request.pickupAddress}</div>
                  </div>
                  <div>
                    <span className="font-medium">To:</span>
                    <div className="text-gray-600 truncate">{request.destinationAddress}</div>
                  </div>
                </div>

                {request.assignedDriverId && (
                  <div className="text-sm">
                    <span className="font-medium">Driver:</span> {getDriverName(request.assignedDriverId)}
                  </div>
                )}

                <div className="text-sm bg-gray-50 p-2 rounded">
                  <div>
                    <span className="font-medium">Distance:</span> {distance.toFixed(1)} km
                  </div>
                  <div>
                    <span className="font-medium">Est. Time:</span> {Math.round(distance * 2)} minutes
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onShowRoute(request.id)}>
                    Show Route
                  </Button>
                  {request.status === "pending" && (
                    <Button variant="outline" size="sm" onClick={() => onCancelRide(request.id)}>
                      Cancel
                    </Button>
                  )}
                  {request.status === "in-progress" && (
                    <Button variant="default" size="sm" onClick={() => onCompleteRide(request.id)}>
                      Complete Ride
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
