"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LocationSearchProps {
  label: string
  placeholder: string
  onLocationSelect: (lat: number, lng: number, address: string) => void
  value?: string
}

export default function LocationSearch({ label, placeholder, onLocationSelect, value = "" }: LocationSearchProps) {
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  useEffect(() => {
    if (!window.google || !inputRef.current) return

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["establishment", "geocode"],
      componentRestrictions: { country: "in" }, // Changed to India
    })

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace()

      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        const address = place.formatted_address || place.name || ""

        setInputValue(address)
        onLocationSelect(lat, lng, address)
      }
    })

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [onLocationSelect])

  useEffect(() => {
    setInputValue(value)
  }, [value])

  return (
    <div>
      <Label htmlFor={label.toLowerCase().replace(" ", "-")}>{label}</Label>
      <Input
        ref={inputRef}
        id={label.toLowerCase().replace(" ", "-")}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="mt-1"
      />
    </div>
  )
}
