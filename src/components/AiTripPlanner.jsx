"use client"
import { useState, useRef, useEffect } from "react"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY
const LARAVEL_API  = process.env.NEXT_PUBLIC_API_URL

// ── Fetch hotels from your backend ───────────────────────────────────────────
async function fetchHotels() {
  try {
    console.log("Fetching hotels from:", `${LARAVEL_API}/hotels`)
    const res  = await fetch(`${LARAVEL_API}/hotels`)
    const data = await res.json()
    console.log("Hotels raw response:", data)
    const hotels = Array.isArray(data) ? data : data.data ?? []
    console.log("Hotels loaded:", hotels.length)
    return hotels
  } catch (err) {
    console.error("fetchHotels error:", err)
    return []
  }
}

// ── Ask Groq to match hotels ──────────────────────────────────────────────────
async function askGroq(messages, hotels) {
  const hotelsSummary = hotels.length > 0
    ? hotels.map(h =>
        `ID:${h.id} | ${h.title} | ${h.location} | AED ${h.price}/night | Type:${h.type ?? "Hotel"} | Rating:${h.rating ?? "N/A"} | Stars:${h.stars ?? "N/A"}`
      ).join("\n")
    : "No hotels available at the moment."

  console.log("Hotels summary sent to AI:", hotelsSummary)

  const system = `You are a luxury hotel concierge for Al Ain Hotels — a premium Dubai hotel booking platform.
Your job is to help users find the perfect hotel based on their needs.

Available hotels:
${hotelsSummary}

Rules:
- Be warm, helpful, and concise (2-3 sentences max per reply)
- When you have enough info (budget, dates, guests, type), recommend 1-3 hotels by their exact ID
- Format recommendations EXACTLY like this on a new line when ready:
  RECOMMENDATIONS:[{"id":1,"reason":"Perfect for couples with marina views"},{"id":2,"reason":"Best value for families"}]
- Use the exact numeric ID from the hotel list above
- If you need more info, ask ONE clarifying question
- Always respond in plain text except for the RECOMMENDATIONS: JSON
- Never make up hotels not in the list
- If no hotels match, say so honestly`

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.error("Groq error:", res.status, errBody)
    throw new Error(`Groq API error ${res.status}: ${errBody}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content ?? ""
  console.log("Groq raw response:", content)
  return content
}

// ── Parse hotel recommendations from Groq response ───────────────────────────
function parseRecommendations(text) {
  const match = text.match(/RECOMMENDATIONS:\s*(\[[\s\S]*?\])/i)
  if (!match) {
    console.log("No RECOMMENDATIONS found in response")
    return { text, recommendations: [] }
  }
  try {
    const recommendations = JSON.parse(match[1])
    console.log("Parsed recommendations:", recommendations)
    const cleanText = text.replace(/RECOMMENDATIONS:\s*\[[\s\S]*?\]/i, "").trim()
    return { text: cleanText, recommendations }
  } catch (err) {
    console.error("Failed to parse recommendations JSON:", err)
    return { text, recommendations: [] }
  }
}

// ── Hotel Card shown inside chat ──────────────────────────────────────────────
function HotelCard({ hotel, reason }) {
  if (!hotel) {
    console.warn("HotelCard: hotel not found")
    return null
  }

  const imageUrl = hotel.image_url?.startsWith("http")
    ? hotel.image_url
    : hotel.image?.startsWith("http")
    ? hotel.image
    : hotel.image
    ? `${LARAVEL_API?.replace("/api", "")}/storage/${hotel.image}`
    : null

  // ✅ FIXED — <a tag was missing before
  return (
    
     <a href={`/hotels/${hotel.slug}`}
      className="block group mt-2 rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all duration-200 bg-white"
    >
      <div className="relative h-32 overflow-hidden bg-stone-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={hotel.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.display = "none" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🏨</div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full text-stone-700">
          AED {hotel.price}/night
        </div>
        {hotel.stars && (
          <div className="absolute top-2 left-2 bg-amber-400/90 text-xs font-semibold px-2 py-1 rounded-full text-white">
            {"★".repeat(Number(hotel.stars))}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-stone-800 text-sm leading-tight">{hotel.title}</p>
        <p className="text-stone-400 text-xs mt-0.5">{hotel.location}</p>
        <p className="text-stone-600 text-xs mt-1.5 italic leading-relaxed">"{reason}"</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-xs text-stone-500">{hotel.rating}</span>
          </div>
          <span className="text-xs text-blue-600 font-medium group-hover:underline">
            View hotel →
          </span>
        </div>
      </div>
    </a>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function AiTripPlanner() {
  const [open,     setOpen]     = useState(false)
  const [input,    setInput]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [hotels,   setHotels]   = useState([])
  const [messages, setMessages] = useState([])
  const [pulse,    setPulse]    = useState(true)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)

  // Load hotels once
  useEffect(() => {
    fetchHotels().then(data => {
      setHotels(data)
      console.log("Hotels set in state:", data.length, "hotels")
    })
  }, [])

  // Stop pulse after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 5000)
    return () => clearTimeout(t)
  }, [])

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hi! I'm your Dubai hotel concierge ✨\n\nTell me about your ideal stay — budget, dates, number of guests, or what kind of experience you're looking for.",
        recommendations: [],
      }])
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    console.log("=== SEND ===")
    console.log("GROQ Key:", GROQ_API_KEY ? "✅ Loaded" : "❌ undefined")
    console.log("LARAVEL API:", LARAVEL_API ?? "❌ undefined")
    console.log("Hotels in state:", hotels.length)

    const userMsg = { role: "user", content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const groqHistory = newMessages.map(m => ({ role: m.role, content: m.content }))
      const raw = await askGroq(groqHistory, hotels)
      const { text: cleanText, recommendations } = parseRecommendations(raw)

      console.log("Clean text:", cleanText)
      console.log("Recommendations:", recommendations)
      console.log("Hotels to match against:", hotels.map(h => h.id))

      setMessages(prev => [...prev, {
        role: "assistant",
        content: cleanText,
        recommendations,
      }])
    } catch (err) {
      console.error("Send error:", err)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        recommendations: [],
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const reset = () => {
    setMessages([])
    setOpen(false)
    setTimeout(() => setOpen(true), 50)
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {pulse && !open && (
          <div className="bg-stone-900 text-white text-xs px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            AI Trip Planner ✨
          </div>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          className="relative w-14 h-14 rounded-full bg-stone-900 hover:bg-stone-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center"
          aria-label="Open AI Trip Planner"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
          )}
          {pulse && !open && (
            <span className="absolute inset-0 rounded-full bg-stone-900 animate-ping opacity-30" />
          )}
        </button>
      </div>

      {/* ── Chat Window ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
          style={{ maxHeight: "75vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">AI Concierge</p>
                <p className="text-xs text-stone-400">
                  Al Ain Hotels
                  {hotels.length > 0 && (
                    <span className="ml-1 text-green-500">· {hotels.length} hotels</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="text-xs text-stone-400 hover:text-stone-600 transition px-2 py-1 rounded-lg hover:bg-stone-100"
            >
              New chat
            </button>
          </div>

          {/* Warning if no hotels loaded */}
          {hotels.length === 0 && (
            <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700">⚠️ Loading hotel data...</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-stone-900 text-white rounded-br-sm"
                      : "bg-stone-100 text-stone-800 rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>

                  {/* Hotel recommendations */}
                  {msg.recommendations?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.recommendations.map(rec => {
                        const hotel = hotels.find(h => String(h.id) === String(rec.id))
                        console.log(`Looking for hotel id ${rec.id}:`, hotel ? hotel.title : "NOT FOUND")
                        return <HotelCard key={rec.id} hotel={hotel} reason={rec.reason} />
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-stone-100 rounded-2xl rounded-bl-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {[
                "Romantic weekend for 2",
                "Family trip, 4 guests",
                "Business trip, budget AED 500",
                "Luxury suite with pool",
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); inputRef.current?.focus() }}
                  className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-1.5 rounded-full transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-stone-100">
            <div className="flex items-end gap-2 bg-stone-50 rounded-2xl px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Describe your perfect stay…"
                rows={1}
                className="flex-1 bg-transparent text-sm text-stone-800 placeholder-stone-400 resize-none outline-none leading-relaxed"
                style={{ maxHeight: "80px" }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 transition disabled:opacity-30 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-xs text-stone-300 mt-2">Powered by Groq AI · Free</p>
          </div>
        </div>
      )}
    </>
  )
}