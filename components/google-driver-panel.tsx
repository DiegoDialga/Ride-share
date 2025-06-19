"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GoogleMapsDriver, GoogleMapsRideRequest } from "../types/google-maps"

interface GoogleDriverPanelProps {
  drivers: Map<string, GoogleMapsDriver>
  rideRequests: GoogleMapsRideRequest[]
  onToggleAvailability: (driverId: string) => void
}

export default function GoogleDriverPanel({ drivers, rideRequests, onToggleAvailability }: GoogleDriverPanelProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Driver Status</CardTitle>
        <CardDescription>Current driver locations and availability</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from(drivers.values()).map((driver) => (
          <div key={driver.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{driver.name}</span>
                <Badge variant={driver.available ? "default" : "secondary"}>
                  {driver.available ? "Available" : "Busy"}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Location: {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
              </div>
              <div className="text-sm text-gray-600">Rating: {driver.rating}★</div>

              {/* Show assigned ride if any */}
              {rideRequests
                .filter((req) => req.assignedDriverId === driver.id && req.status !== "completed")
                .map((request) => (
                  <div key={request.id} className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <div className="font-medium">Current Ride:</div>
                    <div>Passenger: {request.passengerName}</div>
                    <div className="truncate">From: {request.pickupAddress}</div>
                    <div className="truncate">To: {request.destinationAddress}</div>
                    <Badge variant="outline" className="mt-1">
                      {request.status}
                    </Badge>
                  </div>
                ))}
            </div>

            <Button
              variant={driver.available ? "outline" : "default"}
              size="sm"
              onClick={() => onToggleAvailability(driver.id)}
            >
              {driver.available ? "Go Offline" : "Go Online"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
