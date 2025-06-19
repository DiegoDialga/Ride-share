"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import GraphCanvas from "./components/graph-canvas"
import RideRequestForm from "./components/ride-request-form"
import DriverPanel from "./components/driver-panel"
import RideStatus from "./components/ride-status"
import { Graph } from "./utils/graph-algorithms"
import type { Node, Edge, Driver, RideRequest, RouteResult } from "./types/graph"

export default function RideSharingSystem() {
  const [graph] = useState(() => {
    const g = new Graph()

    // Create city nodes (intersections)
    const cityNodes: Node[] = [
      { id: "A", x: 100, y: 100, name: "Downtown", type: "intersection" },
      { id: "B", x: 300, y: 100, name: "Mall", type: "intersection" },
      { id: "C", x: 500, y: 100, name: "Airport", type: "intersection" },
      { id: "D", x: 100, y: 250, name: "University", type: "intersection" },
      { id: "E", x: 300, y: 250, name: "Hospital", type: "intersection" },
      { id: "F", x: 500, y: 250, name: "Stadium", type: "intersection" },
      { id: "G", x: 100, y: 400, name: "Beach", type: "intersection" },
      { id: "H", x: 300, y: 400, name: "Park", type: "intersection" },
      { id: "I", x: 500, y: 400, name: "Station", type: "intersection" },
      { id: "J", x: 700, y: 250, name: "Office District", type: "intersection" },
    ]

    cityNodes.forEach((node) => g.addNode(node))

    // Create road connections with weights (travel time/distance)
    const roads: Edge[] = [
      { from: "A", to: "B", weight: 5, distance: 5 },
      { from: "B", to: "C", weight: 7, distance: 7 },
      { from: "A", to: "D", weight: 4, distance: 4 },
      { from: "B", to: "E", weight: 3, distance: 3 },
      { from: "C", to: "F", weight: 6, distance: 6 },
      { from: "D", to: "E", weight: 5, distance: 5 },
      { from: "E", to: "F", weight: 4, distance: 4 },
      { from: "D", to: "G", weight: 8, distance: 8 },
      { from: "E", to: "H", weight: 6, distance: 6 },
      { from: "F", to: "I", weight: 5, distance: 5 },
      { from: "G", to: "H", weight: 4, distance: 4 },
      { from: "H", to: "I", weight: 3, distance: 3 },
      { from: "C", to: "J", weight: 8, distance: 8 },
      { from: "F", to: "J", weight: 5, distance: 5 },
      { from: "I", to: "J", weight: 7, distance: 7 },
      // Additional connections for better connectivity
      { from: "A", to: "E", weight: 6, distance: 6 },
      { from: "B", to: "H", weight: 8, distance: 8 },
      { from: "D", to: "H", weight: 7, distance: 7 },
    ]

    roads.forEach((road) => g.addEdge(road))

    return g
  })

  const [drivers, setDrivers] = useState<Map<string, Driver>>(() => {
    const driverMap = new Map()
    const initialDrivers: Driver[] = [
      { id: "driver1", name: "Alice Johnson", nodeId: "A", available: true, rating: 4.8 },
      { id: "driver2", name: "Bob Smith", nodeId: "E", available: true, rating: 4.6 },
      { id: "driver3", name: "Carol Davis", nodeId: "I", available: true, rating: 4.9 },
      { id: "driver4", name: "David Wilson", nodeId: "C", available: false, rating: 4.7 },
      { id: "driver5", name: "Eva Brown", nodeId: "G", available: true, rating: 4.5 },
    ]

    initialDrivers.forEach((driver) => driverMap.set(driver.id, driver))
    return driverMap
  })

  const [rideRequests, setRideRequests] = useState<RideRequest[]>([])
  const [routes, setRoutes] = useState<Map<string, RouteResult>>(new Map())
  const [highlightedPath, setHighlightedPath] = useState<string[]>([])
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null)

  // Auto-refresh animation for ride request indicators
  useEffect(() => {
    const interval = setInterval(() => {
      // This will trigger re-renders for animated indicators
      setRideRequests((prev) => [...prev])
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const handleRideRequest = useCallback(
    (requestData: Omit<RideRequest, "id" | "timestamp" | "status">) => {
      const newRequest: RideRequest = {
        ...requestData,
        id: `ride_${Date.now()}`,
        timestamp: Date.now(),
        status: "pending",
      }

      setRideRequests((prev) => [...prev, newRequest])

      // Find and assign nearest available driver
      setTimeout(() => {
        const nearestDrivers = graph.findNearestDrivers(newRequest.pickupNodeId, drivers)
        const availableDriver = nearestDrivers.find((driverId) => drivers.get(driverId)?.available)

        if (availableDriver) {
          // Calculate route from driver to pickup, then to destination
          const driverNode = drivers.get(availableDriver)!.nodeId
          const pickupRoute = graph.dijkstra(driverNode, newRequest.pickupNodeId)
          const mainRoute = graph.dijkstra(newRequest.pickupNodeId, newRequest.destinationNodeId)

          if (pickupRoute && mainRoute) {
            // Combine routes (driver -> pickup -> destination)
            const fullRoute: RouteResult = {
              path: [...pickupRoute.path, ...mainRoute.path.slice(1)],
              distance: pickupRoute.distance + mainRoute.distance,
              estimatedTime: pickupRoute.estimatedTime + mainRoute.estimatedTime,
            }

            setRoutes((prev) => new Map(prev).set(newRequest.id, fullRoute))

            // Update request status and assign driver
            setRideRequests((prev) =>
              prev.map((req) =>
                req.id === newRequest.id ? { ...req, status: "matched", assignedDriverId: availableDriver } : req,
              ),
            )

            // Mark driver as unavailable
            setDrivers((prev) => {
              const newDrivers = new Map(prev)
              const driver = newDrivers.get(availableDriver)!
              newDrivers.set(availableDriver, { ...driver, available: false })
              return newDrivers
            })

            // Simulate ride progress
            setTimeout(() => {
              setRideRequests((prev) =>
                prev.map((req) => (req.id === newRequest.id ? { ...req, status: "in-progress" } : req)),
              )
            }, 2000)
          }
        }
      }, 1000)
    },
    [graph, drivers],
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
      setRoutes((prev) => {
        const newRoutes = new Map(prev)
        newRoutes.delete(rideId)
        return newRoutes
      })
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
            nodeId: ride.destinationNodeId,
          })
          return newDrivers
        })
      }

      setRideRequests((prev) => prev.map((req) => (req.id === rideId ? { ...req, status: "completed" } : req)))
    },
    [rideRequests],
  )

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      // Show route to clicked node if there's a selected ride
      if (selectedRideId) {
        const ride = rideRequests.find((r) => r.id === selectedRideId)
        if (ride) {
          const route = graph.dijkstra(ride.pickupNodeId, nodeId)
          if (route) {
            setHighlightedPath(route.path)
          }
        }
      }
    },
    [selectedRideId, rideRequests, graph],
  )

  const handleRideSelect = useCallback(
    (rideId: string) => {
      setSelectedRideId(rideId)
      const route = routes.get(rideId)
      if (route) {
        setHighlightedPath(route.path)
      }
    },
    [routes],
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚗 Ride-Sharing System
              <Badge variant="outline">Graph Algorithms Demo</Badge>
            </CardTitle>
            <CardDescription>
              Interactive demonstration of graph algorithms in a ride-sharing context. Features Dijkstra's shortest
              path, BFS for driver matching, and real-time route optimization.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph Visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>City Map & Routes</CardTitle>
                <CardDescription>
                  Click nodes to explore routes. Animated indicators show active ride requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GraphCanvas
                  nodes={graph.getNodes()}
                  edges={graph.getEdges()}
                  drivers={drivers}
                  rideRequests={rideRequests.filter((r) => r.status !== "completed")}
                  highlightedPath={highlightedPath}
                  onNodeClick={handleNodeClick}
                />
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Intersection</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Pickup</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Destination</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Active Route</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <RideRequestForm nodes={graph.getNodes()} onSubmitRequest={handleRideRequest} />

            <DriverPanel
              drivers={drivers}
              rideRequests={rideRequests}
              nodes={graph.getNodes()}
              onToggleAvailability={handleToggleDriverAvailability}
            />
          </div>
        </div>

        {/* Ride Status */}
        <RideStatus
          rideRequests={rideRequests}
          drivers={drivers}
          nodes={graph.getNodes()}
          routes={routes}
          onCancelRide={handleCancelRide}
          onCompleteRide={handleCompleteRide}
        />

        {/* Algorithm Info */}
        <Card>
          <CardHeader>
            <CardTitle>Graph Algorithms Used</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Dijkstra's Algorithm</h3>
              <p className="text-sm text-gray-600">
                Finds the shortest path between pickup and destination points, optimizing for minimum travel time and
                distance.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Breadth-First Search</h3>
              <p className="text-sm text-gray-600">
                Locates the nearest available drivers to passenger pickup locations, ensuring quick response times.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Graph Representation</h3>
              <p className="text-sm text-gray-600">
                City intersections as nodes and roads as weighted edges, enabling efficient pathfinding and route
                optimization.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
