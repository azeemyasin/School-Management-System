import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a helpful school management assistant. You can help with:
      - School policies and procedures
      - Class schedules and timetables
      - Fee payment information
      - Academic calendar
      - General school information
      - Student and parent queries
      
      Keep responses concise and helpful. If you don't know something specific about the school, suggest contacting the school office.`,
      prompt: message,
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
