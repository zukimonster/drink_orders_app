import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "orders.json")

interface DrinkOrder {
  id: string
  name: string
  caffeine: "decaf" | "regular"
  drinkType: string
  timestamp: number
  completed: boolean
}

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Read orders from file
async function readOrders(): Promise<DrinkOrder[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(DATA_FILE, "utf8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Write orders to file
async function writeOrders(orders: DrinkOrder[]) {
  await ensureDataDir()
  await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2))
}

export async function GET() {
  try {
    const orders = await readOrders()
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: "Failed to read orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const newOrder = await request.json()
    const orders = await readOrders()

    const orderWithDefaults = {
      ...newOrder,
      id: Date.now().toString(),
      timestamp: Date.now(),
      completed: false,
    }

    orders.push(orderWithDefaults)
    await writeOrders(orders)

    return NextResponse.json(orderWithDefaults)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedOrder = await request.json()
    const orders = await readOrders()

    const index = orders.findIndex((order) => order.id === updatedOrder.id)
    if (index === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    orders[index] = updatedOrder
    await writeOrders(orders)

    return NextResponse.json(updatedOrder)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 })
    }

    const orders = await readOrders()
    const filteredOrders = orders.filter((order) => order.id !== id)

    if (filteredOrders.length === orders.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    await writeOrders(filteredOrders)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
