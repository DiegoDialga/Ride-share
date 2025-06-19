"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Driver, RideRequest, Node } from "../types/graph"

interface DriverPanelProps {
  drivers: Map<string, Driver>
  rideRequests: RideRequest[]
  nodes: Node[]
  onToggleAvailability: (driverId: string) => void
}

export default function DriverPanel({ drivers, rideRequests, nodes, onToggleAvailability }: DriverPanelProps) {
  const getNodeName = (nodeId: string) => {
    return nodes.find((n) => n.id === nodeId)?.name || nodeId
  }

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
              <div className="text-sm text-gray-600">Location: {getNodeName(driver.nodeId)}</div>
              <div className="text-sm text-gray-600">Rating: {driver.rating}★</div>

              {/* Show assigned ride if any */}
              {rideRequests
                .filter((req) => req.assignedDriverId === driver.id && req.status !== "completed")
                .map((request) => (
                  <div key={request.id} className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <div className="font-medium">Current Ride:</div>
                    <div>Passenger: {request.passengerName}</div>
                    <div>From: {getNodeName(request.pickupNodeId)}</div>
                    <div>To: {getNodeName(request.destinationNodeId)}</div>
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
