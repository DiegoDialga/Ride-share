"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { RideRequest, Driver, Node, RouteResult } from "../types/graph"

interface RideStatusProps {
  rideRequests: RideRequest[]
  drivers: Map<string, Driver>
  nodes: Node[]
  routes: Map<string, RouteResult>
  onCancelRide: (rideId: string) => void
  onCompleteRide: (rideId: string) => void
}

export default function RideStatus({
  rideRequests,
  drivers,
  nodes,
  routes,
  onCancelRide,
  onCompleteRide,
}: RideStatusProps) {
  const getNodeName = (nodeId: string) => {
    return nodes.find((n) => n.id === nodeId)?.name || nodeId
  }

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ride Requests</CardTitle>
        <CardDescription>Current and recent ride requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rideRequests.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No ride requests yet</div>
        ) : (
          rideRequests.map((request) => {
            const route = routes.get(request.id)
            return (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{request.passengerName}</span>
                    <Badge variant={getStatusColor(request.status)}>{request.status}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(request.timestamp).toLocaleTimeString()}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">From:</span> {getNodeName(request.pickupNodeId)}
                  </div>
                  <div>
                    <span className="font-medium">To:</span> {getNodeName(request.destinationNodeId)}
                  </div>
                </div>

                {request.assignedDriverId && (
                  <div className="text-sm">
                    <span className="font-medium">Driver:</span> {getDriverName(request.assignedDriverId)}
                  </div>
                )}

                {route && (
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    <div>
                      <span className="font-medium">Distance:</span> {route.distance.toFixed(1)} units
                    </div>
                    <div>
                      <span className="font-medium">Est. Time:</span> {route.estimatedTime} minutes
                    </div>
                    <div>
                      <span className="font-medium">Route:</span>{" "}
                      {route.path.map((nodeId) => getNodeName(nodeId)).join(" → ")}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
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
