"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import type { Node, Edge, Driver, RideRequest } from "../types/graph"

interface GraphCanvasProps {
  nodes: Node[]
  edges: Edge[]
  drivers: Map<string, Driver>
  rideRequests: RideRequest[]
  highlightedPath?: string[]
  onNodeClick?: (nodeId: string) => void
}

export default function GraphCanvas({
  nodes,
  edges,
  drivers,
  rideRequests,
  highlightedPath = [],
  onNodeClick,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from)
      const toNode = nodes.find((n) => n.id === edge.to)

      if (fromNode && toNode) {
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)

        // Highlight path edges
        if (highlightedPath.includes(edge.from) && highlightedPath.includes(edge.to)) {
          const fromIndex = highlightedPath.indexOf(edge.from)
          const toIndex = highlightedPath.indexOf(edge.to)
          if (Math.abs(fromIndex - toIndex) === 1) {
            ctx.strokeStyle = "#ef4444"
            ctx.lineWidth = 4
          } else {
            ctx.strokeStyle = "#94a3b8"
            ctx.lineWidth = 2
          }
        } else {
          ctx.strokeStyle = "#94a3b8"
          ctx.lineWidth = 2
        }

        ctx.stroke()

        // Draw weight labels
        const midX = (fromNode.x + toNode.x) / 2
        const midY = (fromNode.y + toNode.y) / 2
        ctx.fillStyle = "#64748b"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(edge.weight.toString(), midX, midY - 5)
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      const isHighlighted = highlightedPath.includes(node.id)
      const isHovered = hoveredNode === node.id

      // Determine node color based on type and state
      let fillColor = "#3b82f6" // Default blue
      let strokeColor = "#1e40af"

      if (node.type === "pickup") {
        fillColor = "#10b981"
        strokeColor = "#059669"
      } else if (node.type === "destination") {
        fillColor = "#f59e0b"
        strokeColor = "#d97706"
      } else if (node.type === "driver") {
        fillColor = "#8b5cf6"
        strokeColor = "#7c3aed"
      }

      if (isHighlighted) {
        fillColor = "#ef4444"
        strokeColor = "#dc2626"
      }

      // Draw node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, isHovered ? 12 : 10, 0, 2 * Math.PI)
      ctx.fillStyle = fillColor
      ctx.fill()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw node label
      ctx.fillStyle = "#1f2937"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(node.name, node.x, node.y - 15)

      // Draw driver info if applicable
      const driver = Array.from(drivers.values()).find((d) => d.nodeId === node.id)
      if (driver) {
        ctx.fillStyle = driver.available ? "#10b981" : "#ef4444"
        ctx.font = "10px Arial"
        ctx.fillText(`${driver.name} (${driver.rating}★)`, node.x, node.y + 20)
      }
    })

    // Draw ride request indicators
    rideRequests.forEach((request) => {
      const pickupNode = nodes.find((n) => n.id === request.pickupNodeId)
      const destNode = nodes.find((n) => n.id === request.destinationNodeId)

      if (pickupNode) {
        // Animated pickup indicator
        const time = Date.now() / 1000
        const radius = 15 + Math.sin(time * 3) * 3
        ctx.beginPath()
        ctx.arc(pickupNode.x, pickupNode.y, radius, 0, 2 * Math.PI)
        ctx.strokeStyle = "#10b981"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.stroke()
        ctx.setLineDash([])
      }

      if (destNode) {
        // Animated destination indicator
        const time = Date.now() / 1000
        const radius = 15 + Math.sin(time * 3 + Math.PI) * 3
        ctx.beginPath()
        ctx.arc(destNode.x, destNode.y, radius, 0, 2 * Math.PI)
        ctx.strokeStyle = "#f59e0b"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.stroke()
        ctx.setLineDash([])
      }
    })
  }, [nodes, edges, drivers, rideRequests, highlightedPath, hoveredNode])

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find hovered node
    const hoveredNode = nodes.find((node) => {
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2)
      return distance <= 12
    })

    setHoveredNode(hoveredNode?.id || null)
  }

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !onNodeClick) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find clicked node
    const clickedNode = nodes.find((node) => {
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2)
      return distance <= 12
    })

    if (clickedNode) {
      onNodeClick(clickedNode.id)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border border-gray-300 rounded-lg cursor-pointer"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    />
  )
}
