export interface Node {
  id: string
  x: number
  y: number
  name: string
  type: "intersection" | "pickup" | "destination" | "driver"
}

export interface Edge {
  from: string
  to: string
  weight: number
  distance: number
}

export interface Driver {
  id: string
  name: string
  nodeId: string
  available: boolean
  rating: number
}

export interface RideRequest {
  id: string
  passengerId: string
  passengerName: string
  pickupNodeId: string
  destinationNodeId: string
  timestamp: number
  status: "pending" | "matched" | "in-progress" | "completed"
  assignedDriverId?: string
}

export interface RouteResult {
  path: string[]
  distance: number
  estimatedTime: number
}
