import type { GoogleMapsDriver, GoogleMapsRideRequest } from "../types/google-maps"

// Calculate distance between two points using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Find nearest available drivers using distance calculation
export function findNearestDrivers(
  pickupLat: number,
  pickupLng: number,
  drivers: Map<string, GoogleMapsDriver>,
  maxDistanceKm = 10,
): Array<{ driverId: string; distance: number }> {
  const nearbyDrivers: Array<{ driverId: string; distance: number }> = []

  drivers.forEach((driver, driverId) => {
    if (!driver.available) return

    const distance = calculateDistance(pickupLat, pickupLng, driver.lat, driver.lng)

    if (distance <= maxDistanceKm) {
      nearbyDrivers.push({ driverId, distance })
    }
  })

  // Sort by distance (closest first)
  return nearbyDrivers.sort((a, b) => a.distance - b.distance)
}

// Calculate route using Google Directions API
export async function calculateRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
): Promise<{ distance: string; duration: string; polyline: string; directionsResult: any } | null> {
  if (!window.google) return null

  const directionsService = new window.google.maps.DirectionsService()

  return new Promise((resolve) => {
    directionsService.route(
      {
        origin: { lat: originLat, lng: originLng },
        destination: { lat: destLat, lng: destLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      },
      (result: any, status: any) => {
        if (status === "OK" && result.routes.length > 0) {
          const route = result.routes[0]
          const leg = route.legs[0]

          resolve({
            distance: leg.distance.text,
            duration: leg.duration.text,
            polyline: route.overview_polyline,
            directionsResult: result,
          })
        } else {
          console.error("Directions request failed:", status)
          resolve(null)
        }
      },
    )
  })
}

// Driver matching algorithm with multiple criteria
export function matchDriverToRide(
  request: GoogleMapsRideRequest,
  drivers: Map<string, GoogleMapsDriver>,
): string | null {
  const nearbyDrivers = findNearestDrivers(
    request.pickupLat,
    request.pickupLng,
    drivers,
    15, // 15km radius
  )

  if (nearbyDrivers.length === 0) return null

  // Score drivers based on distance and rating
  const scoredDrivers = nearbyDrivers.map(({ driverId, distance }) => {
    const driver = drivers.get(driverId)!

    // Scoring algorithm: closer distance and higher rating = better score
    const distanceScore = Math.max(0, 10 - distance) // Max 10 points for distance
    const ratingScore = driver.rating * 2 // Max 10 points for rating (5 stars * 2)
    const totalScore = distanceScore + ratingScore

    return { driverId, distance, rating: driver.rating, score: totalScore }
  })

  // Sort by score (highest first)
  scoredDrivers.sort((a, b) => b.score - a.score)

  return scoredDrivers[0].driverId
}
