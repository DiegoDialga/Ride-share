export interface GoogleMapsNode {
  id: string
  name: string
  lat: number
  lng: number
  type: "intersection" | "pickup" | "destination" | "driver"
}

export interface GoogleMapsDriver {
  id: string
  name: string
  lat: number
  lng: number
  available: boolean
  rating: number
}

export interface GoogleMapsRideRequest {
  id: string
  passengerId: string
  passengerName: string
  pickupLat: number
  pickupLng: number
  pickupAddress: string
  destinationLat: number
  destinationLng: number
  destinationAddress: string
  timestamp: number
  status: "pending" | "matched" | "in-progress" | "completed"
  assignedDriverId?: string
}

export interface RouteInfo {
  distance: string
  duration: string
  polyline: string
  directionsResult?: any
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}
