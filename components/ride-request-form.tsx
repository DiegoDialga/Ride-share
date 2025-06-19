"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Node, RideRequest } from "../types/graph"

interface RideRequestFormProps {
  nodes: Node[]
  onSubmitRequest: (request: Omit<RideRequest, "id" | "timestamp" | "status">) => void
}

export default function RideRequestForm({ nodes, onSubmitRequest }: RideRequestFormProps) {
  const [passengerName, setPassengerName] = useState("")
  const [pickupNodeId, setPickupNodeId] = useState("")
  const [destinationNodeId, setDestinationNodeId] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!passengerName || !pickupNodeId || !destinationNodeId) {
      alert("Please fill in all fields")
      return
    }

    if (pickupNodeId === destinationNodeId) {
      alert("Pickup and destination cannot be the same")
      return
    }

    onSubmitRequest({
      passengerId: `passenger_${Date.now()}`,
      passengerName,
      pickupNodeId,
      destinationNodeId,
    })

    // Reset form
    setPassengerName("")
    setPickupNodeId("")
    setDestinationNodeId("")
  }

  const availableNodes = nodes.filter((node) => node.type === "intersection")

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Request a Ride</CardTitle>
        <CardDescription>Enter your pickup and destination locations</CardDescription>
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

          <div>
            <Label htmlFor="pickup">Pickup Location</Label>
            <Select value={pickupNodeId} onValueChange={setPickupNodeId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select pickup location" />
              </SelectTrigger>
              <SelectContent>
                {availableNodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="destination">Destination</Label>
            <Select value={destinationNodeId} onValueChange={setDestinationNodeId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {availableNodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Request Ride
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
