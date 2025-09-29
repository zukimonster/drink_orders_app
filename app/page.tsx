"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Settings, Coffee, Plus } from "lucide-react"
import Link from "next/link"

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

export default function HomePage() {
  const [orders, setOrders] = useState<DrinkOrder[]>([])
  const [drinkChoices, setDrinkChoices] = useState<DrinkChoice[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    caffeine: "regular" as "decaf" | "regular",
    drinkType: "",
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.drinkType) return

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          caffeine: formData.caffeine,
          drinkType: formData.drinkType,
        }),
      })

      if (response.ok) {
        const newOrder = await response.json()
        setOrders((prev) => [...prev, newOrder])
        setFormData({ name: "", caffeine: "regular", drinkType: "" })
        setShowForm(false)
      }
    } catch (error) {
      console.error("Failed to submit order:", error)
    }
  }

  const toggleOrderCompletion = async (order: DrinkOrder) => {
    try {
      const updatedOrder = { ...order, completed: !order.completed }
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedOrder),
      })

      if (response.ok) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? updatedOrder : o)))
      }
    } catch (error) {
      console.error("Failed to update order:", error)
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Coffee className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-balance">Coffee Orders</h1>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Add Order Button */}
        {!showForm && (
          <div className="mb-8">
            <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Drink Order
            </Button>
          </div>
        )}

        {/* Order Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Drink Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Caffeine Preference</Label>
                  <RadioGroup
                    value={formData.caffeine}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, caffeine: value as "decaf" | "regular" }))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="regular" />
                      <Label htmlFor="regular">Regular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="decaf" id="decaf" />
                      <Label htmlFor="decaf">Decaf</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drink-type">Drink Type</Label>
                  <Select
                    value={formData.drinkType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, drinkType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a drink type" />
                    </SelectTrigger>
                    <SelectContent>
                      {drinkChoices.map((choice) => (
                        <SelectItem key={choice.id} value={choice.id}>
                          {choice.description ? `${choice.name} (${choice.description})` : choice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={!formData.name.trim() || !formData.drinkType}>
                    Submit Order
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Current Orders ({orders.length})</h2>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No orders yet. Click "Add Drink Order" to get started!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={order.completed}
                        onCheckedChange={() => toggleOrderCompletion(order)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-lg ${order.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {order.name}
                        </h3>
                        <p className={`text-muted-foreground ${order.completed ? "line-through" : ""}`}>
                          {getDrinkDisplayName(order.drinkType)} • {order.caffeine === "decaf" ? "Decaf" : "Regular"}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Network Access Info */}
        <Card className="mt-8 bg-muted/50">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Local Network Access:</strong> Share this URL with your team to collect orders from any device on
              your network
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
