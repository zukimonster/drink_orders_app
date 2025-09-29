"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Trash2, Coffee, Plus } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DrinkOrder {
  id: string
  name: string
  caffeine: "decaf" | "regular"
  drinkType: string
  timestamp: number
  completed: boolean
}

interface DrinkChoice {
  id: string
  name: string
  description?: string
}

export default function SettingsPage() {
  const [orders, setOrders] = useState<DrinkOrder[]>([])
  const [drinkChoices, setDrinkChoices] = useState<DrinkChoice[]>([])
  const [showAddDrink, setShowAddDrink] = useState(false)
  const [newDrink, setNewDrink] = useState({ name: "", description: "" })

  useEffect(() => {
    fetchOrders()
    fetchDrinkChoices()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  }

  const fetchDrinkChoices = async () => {
    try {
      const response = await fetch("/api/drink-choices")
      if (response.ok) {
        const data = await response.json()
        setDrinkChoices(data)
      }
    } catch (error) {
      console.error("Failed to fetch drink choices:", error)
    }
  }

  const removeOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        setOrders((prev) => prev.filter((order) => order.id !== id))
      }
    } catch (error) {
      console.error("Failed to remove order:", error)
    }
  }

  const clearAllOrders = async () => {
    try {
      // Delete each order individually since we don't have a bulk delete endpoint
      await Promise.all(orders.map((order) => fetch(`/api/orders?id=${order.id}`, { method: "DELETE" })))
      setOrders([])
    } catch (error) {
      console.error("Failed to clear orders:", error)
    }
  }

  const addDrinkChoice = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Add drink choice form submitted", { newDrink })

    if (!newDrink.name.trim()) {
      console.log("[v0] No drink name provided, returning early")
      return
    }

    try {
      console.log("[v0] Sending POST request to /api/drink-choices")
      const response = await fetch("/api/drink-choices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDrink),
      })

      console.log("[v0] Response status:", response.status)

      if (response.ok) {
        const addedChoice = await response.json()
        console.log("[v0] Successfully added choice:", addedChoice)
        setDrinkChoices((prev) => [...prev, addedChoice])
        setNewDrink({ name: "", description: "" })
        setShowAddDrink(false)
      } else {
        console.log("[v0] Response not ok:", await response.text())
      }
    } catch (error) {
      console.error("[v0] Failed to add drink choice:", error)
    }
  }

  const removeDrinkChoice = async (id: string) => {
    try {
      const response = await fetch(`/api/drink-choices?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        setDrinkChoices((prev) => prev.filter((choice) => choice.id !== id))
      }
    } catch (error) {
      console.error("Failed to remove drink choice:", error)
    }
  }

  const getDrinkDisplayName = (drinkType: string) => {
    const choice = drinkChoices.find((c) => c.id === drinkType)
    if (choice) {
      return choice.description ? `${choice.name} (${choice.description})` : choice.name
    }
    return drinkType
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Coffee className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Manage Drink Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showAddDrink && (
              <Button onClick={() => setShowAddDrink(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Drink Choice
              </Button>
            )}

            {showAddDrink && (
              <form onSubmit={addDrinkChoice} className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="drink-name">Drink Name</Label>
                  <Input
                    id="drink-name"
                    value={newDrink.name}
                    onChange={(e) => setNewDrink((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Cappuccino"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drink-description">Description (optional)</Label>
                  <Input
                    id="drink-description"
                    value={newDrink.description}
                    onChange={(e) => setNewDrink((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Espresso with steamed milk foam"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Choice</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddDrink(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold">Current Drink Choices:</h3>
              {drinkChoices.map((choice) => (
                <div key={choice.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{choice.name}</span>
                    {choice.description && <span className="text-muted-foreground ml-2">({choice.description})</span>}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Drink Choice</AlertDialogTitle>
                        <AlertDialogDescription>
                          Remove "{choice.name}" from the drink choices? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeDrinkChoice(choice.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clear All Orders */}
        {orders.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Manage Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Orders
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Orders</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {orders.length} coffee orders. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearAllOrders}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}

        {/* Individual Orders Management */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Remove Individual Orders</h2>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No orders to manage. Orders will appear here once they're added.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3
                          className={`font-semibold text-lg ${order.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {order.name} {order.completed && "✓"}
                        </h3>
                        <p className={`text-muted-foreground ${order.completed ? "line-through" : ""}`}>
                          {getDrinkDisplayName(order.drinkType)} • {order.caffeine === "decaf" ? "Decaf" : "Regular"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ordered at {new Date(order.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Order</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove {order.name}'s order for a {getDrinkDisplayName(order.drinkType)}? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeOrder(order.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
