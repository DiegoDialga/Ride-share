/*"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LocationSearch from "./location-search"
import type { GoogleMapsRideRequest } from "../types/google-maps"
import CurrentLocationButton from "./current-location-button"
import {db} from '@/lib/firebase'
import {setDoc, doc} from 'firebase/firestore'

const saveRideToFirestore = async (ride) => {
  try {
    await setDoc(doc(db, 'rides', ride.id), ride);
    console.log('Ride saved to Firestore!');
  } catch (error) {
    console.error('Error saving ride:', error);
  }
};

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

    const rideData = {
      passengerId: `passenger_${Date.now()}`,
      passengerName,
      pickupLat: pickupLocation.lat,
      pickupLng: pickupLocation.lng,
      pickupAddress: pickupLocation.address,
      destinationLat: destinationLocation.lat,
      destinationLng: destinationLocation.lng,
      destinationAddress: destinationLocation.address,
    };

    saveRideToFirestore(rideData)

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
*/
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LocationSearch from "./location-search"
import CurrentLocationButton from "./current-location-button"
import { db } from '@/lib/firebase'
import { setDoc, doc } from 'firebase/firestore'
import type { GoogleMapsRideRequest } from "../types/google-maps"

interface GoogleRideRequestFormProps {
  onSubmitRequest: (request: Omit<GoogleMapsRideRequest, "id" | "timestamp" | "status">) => void
}

// Firestore type
const saveRideToFirestore = async (ride: GoogleMapsRideRequest) => {
  try {
    await setDoc(doc(db, 'rides', ride.id), ride);
    console.log('Ride saved to Firestore!');
  } catch (error) {
    console.error('Error saving ride:', error);
  }
};

export default function GoogleRideRequestForm({ onSubmitRequest }: GoogleRideRequestFormProps) {
  const [passengerName, setPassengerName] = useState("")
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)

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

    const timestamp = Date.now()
    const rideId = `ride_${timestamp}`

    const rideData: GoogleMapsRideRequest = {
      id: rideId,
      timestamp,
      status: "pending",
      passengerId: `passenger_${timestamp}`,
      passengerName,
      pickupLat: pickupLocation.lat,
      pickupLng: pickupLocation.lng,
      pickupAddress: pickupLocation.address,
      destinationLat: destinationLocation.lat,
      destinationLng: destinationLocation.lng,
      destinationAddress: destinationLocation.address,
    }

    // Submit to parent
    onSubmitRequest({
      passengerId: rideData.passengerId,
      passengerName: rideData.passengerName,
      pickupLat: rideData.pickupLat,
      pickupLng: rideData.pickupLng,
      pickupAddress: rideData.pickupAddress,
      destinationLat: rideData.destinationLat,
      destinationLng: rideData.destinationLng,
      destinationAddress: rideData.destinationAddress,
    })

    // Save to Firestore
    saveRideToFirestore(rideData)

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
            <CurrentLocationButton onLocationFound={(lat, lng, address) => setDestinationLocation({ lat, lng, address })} />

            <Button type="submit" className="w-full">
              Request Ride
            </Button>
          </form>
        </CardContent>
      </Card>
  )
}
