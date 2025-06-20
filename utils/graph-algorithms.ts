import type { Node, Edge, RouteResult } from "../types/graph"

export class Graph {
  private nodes: Map<string, Node> = new Map()
  private edges: Map<string, Edge[]> = new Map()

  addNode(node: Node): void {
    this.nodes.set(node.id, node)
    if (!this.edges.has(node.id)) {
      this.edges.set(node.id, [])
    }
  }

  addEdge(edge: Edge): void {
    if (!this.edges.has(edge.from)) {
      this.edges.set(edge.from, [])
    }
    if (!this.edges.has(edge.to)) {
      this.edges.set(edge.to, [])
    }

    this.edges.get(edge.from)!.push(edge)
    // Add reverse edge for undirected graph
    this.edges.get(edge.to)!.push({
      from: edge.to,
      to: edge.from,
      weight: edge.weight,
      distance: edge.distance,
    })
  }

  getNodes(): Node[] {
    return Array.from(this.nodes.values())
  }

  getEdges(): Edge[] {
    const allEdges: Edge[] = []
    this.edges.forEach((edges) => {
      allEdges.push(...edges)
    })
    return allEdges
  }

  getNode(id: string): Node | undefined {
    return this.nodes.get(id)
  }

  getNeighbors(nodeId: string): Edge[] {
    return this.edges.get(nodeId) || []
  }

  // creating a function for Dijkstra's Algorithm for shortest path
  dijkstra(startId: string, endId: string): RouteResult | null {
    const distances = new Map<string, number>()
    const previous = new Map<string, string | null>()
    const unvisited = new Set<string>()

    // Initialize distances
    this.nodes.forEach((_, nodeId) => {
      distances.set(nodeId, nodeId === startId ? 0 : Number.POSITIVE_INFINITY)
      previous.set(nodeId, null)
      unvisited.add(nodeId)
    })

    while (unvisited.size > 0) {
      // Finding unvisited node with minimum distance
      let currentNode: string | null = null
      let minDistance = Number.POSITIVE_INFINITY

      unvisited.forEach((nodeId) => {
        const distance = distances.get(nodeId)!
        if (distance < minDistance) {
          minDistance = distance
          currentNode = nodeId
        }
      })

      if (currentNode === null || minDistance === Number.POSITIVE_INFINITY) break

      unvisited.delete(currentNode)

      if (currentNode === endId) break

      // Update distances to neighbors
      const neighbors = this.getNeighbors(currentNode)
      neighbors.forEach((edge) => {
        if (unvisited.has(edge.to)) {
          const newDistance = distances.get(currentNode!)! + edge.weight
          if (newDistance < distances.get(edge.to)!) {
            distances.set(edge.to, newDistance)
            previous.set(edge.to, currentNode)
          }
        }
      })
    }

    // Reconstruct path
    const path: string[] = []
    let current: string | null = endId

    while (current !== null) {
      path.unshift(current)
      current = previous.get(current)!
    }

    if (path[0] !== startId) {
      return null // No path found
    }

    const totalDistance = distances.get(endId)!
    return {
      path,
      distance: totalDistance,
      estimatedTime: Math.round(totalDistance * 2), // Assume 2 minutes per unit distance
    }
  }

  // Find nearest available drivers using BFS
  findNearestDrivers(pickupNodeId: string, drivers: Map<string, any>, maxDistance = 10): string[] {
    const visited = new Set<string>()
    const queue: Array<{ nodeId: string; distance: number }> = [{ nodeId: pickupNodeId, distance: 0 }]
    const nearbyDrivers: Array<{ driverId: string; distance: number }> = []

    while (queue.length > 0) {
      const { nodeId, distance } = queue.shift()!

      if (visited.has(nodeId) || distance > maxDistance) continue
      visited.add(nodeId)

      // Check if there's an available driver at this node
      drivers.forEach((driver, driverId) => {
        if (driver.nodeId === nodeId && driver.available) {
          nearbyDrivers.push({ driverId, distance })
        }
      })

      // Add neighbors to queue
      const neighbors = this.getNeighbors(nodeId)
      neighbors.forEach((edge) => {
        if (!visited.has(edge.to)) {
          queue.push({ nodeId: edge.to, distance: distance + edge.weight })
        }
      })
    }

    // Sort by distance and return driver IDs
    return nearbyDrivers.sort((a, b) => a.distance - b.distance).map((item) => item.driverId)
  }
}

// Calculate Euclidean distance between two nodes
export function calculateDistance(node1: Node, node2: Node): number {
  const dx = node1.x - node2.x
  const dy = node1.y - node2.y
  return Math.sqrt(dx * dx + dy * dy)
}
