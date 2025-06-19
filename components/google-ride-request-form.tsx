"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LocationSearch from "./location-search"
import type { GoogleMapsRideRequest } from "../types/google-maps"
import CurrentLocationButton from "./current-location-button"

interface GoogleRideRequestFormProps {
  onSubmitRequest: (request: Omit<GoogleMapsRideRequest, "id" | "timestamp" | "status">) => void
}

export default function GoogleRideRequestForm({ onSubmitRequest }: GoogleRideRequestFormProps) {
  const [passengerName, setPassengerName] = useState("")
  const [pickupLocation, setPickupLocation] = useState<{
    lat: number
    lng: number
    address: string
  } | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<{
    lat: number
    lng: number
    address: string
  } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!passengerName || !pickupLocation || !destinationLocation) {
      alert("Please fill in all fields and select valid locations")
      return
    }

    if (pickupLocation.lat === destinationLocation.lat && pickupLocation.lng === destinationLocation.lng) {
      alert("Pickup and destination cannot be the same location")
      return
    }

    onSubmitRequest({
      passengerId: `passenger_${Date.now()}`,
      passengerName,
      pickupLat: pickupLocation.lat,
      pickupLng: pickupLocation.lng,
      pickupAddress: pickupLocation.address,
      destinationLat: destinationLocation.lat,
      destinationLng: destinationLocation.lng,
      destinationAddress: destinationLocation.address,
    })

    // Reset form
    setPassengerName("")
    setPickupLocation(null)
    setDestinationLocation(null)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Request a Ride</CardTitle>
        <CardDescription>Enter your details and select pickup/destination locations</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="passengerName">Your Name</Label>
            <Input
              id="passengerName"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <LocationSearch
            label="Pickup Location"
            placeholder="Search for pickup location in India..."
            onLocationSelect={(lat, lng, address) => setPickupLocation({ lat, lng, address })}
            value={pickupLocation?.address || ""}
          />
          <CurrentLocationButton onLocationFound={(lat, lng, address) => setPickupLocation({ lat, lng, address })} />

          <LocationSearch
            label="Destination"
            placeholder="Search for destination in India..."
            onLocationSelect={(lat, lng, address) => setDestinationLocation({ lat, lng, address })}
            value={destinationLocation?.address || ""}
          />
          <CurrentLocationButton
            onLocationFound={(lat, lng, address) => setDestinationLocation({ lat, lng, address })}
          />

          <Button type="submit" className="w-full">
            Request Ride
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
