import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "drink-choices.json")

interface DrinkChoice {
  id: string
  name: string
  description?: string
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

// Read drink choices from file
async function readDrinkChoices(): Promise<DrinkChoice[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(DATA_FILE, "utf8")
    return JSON.parse(data)
  } catch {
    // Return default choices if file doesn't exist
    const defaultChoices = [
      { id: "latte", name: "Latte", description: "" },
      { id: "americano", name: "Americano", description: "Espresso, no milk, water added" },
      { id: "espresso-shot", name: "Espresso Shot", description: "" },
    ]
    await writeDrinkChoices(defaultChoices)
    return defaultChoices
  }
}

// Write drink choices to file
async function writeDrinkChoices(choices: DrinkChoice[]) {
  await ensureDataDir()
  await fs.writeFile(DATA_FILE, JSON.stringify(choices, null, 2))
}

export async function GET() {
  try {
    const choices = await readDrinkChoices()
    return NextResponse.json(choices)
  } catch (error) {
    console.error("[v0] GET drink choices error:", error)
    return NextResponse.json({ error: "Failed to read drink choices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST drink choice request received")
    const body = await request.json()
    console.log("[v0] Request body:", body)

    const newChoice = body.newDrink || body
    console.log("[v0] New choice to add:", newChoice)

    if (!newChoice.name) {
      console.error("[v0] Missing name in request")
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const choices = await readDrinkChoices()
    console.log("[v0] Current choices:", choices)

    const choiceWithId = {
      ...newChoice,
      id: newChoice.name.toLowerCase().replace(/\s+/g, "-"),
    }
    console.log("[v0] Choice with ID:", choiceWithId)

    choices.push(choiceWithId)
    await writeDrinkChoices(choices)
    console.log("[v0] Successfully added choice")

    return NextResponse.json(choiceWithId)
  } catch (error) {
    console.error("[v0] POST drink choice error:", error)
    return NextResponse.json({ error: "Failed to create drink choice", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Choice ID required" }, { status: 400 })
    }

    const choices = await readDrinkChoices()
    const filteredChoices = choices.filter((choice) => choice.id !== id)

    if (filteredChoices.length === choices.length) {
      return NextResponse.json({ error: "Choice not found" }, { status: 404 })
    }

    await writeDrinkChoices(filteredChoices)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] DELETE drink choice error:", error)
    return NextResponse.json({ error: "Failed to delete drink choice" }, { status: 500 })
  }
}
