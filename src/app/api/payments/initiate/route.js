// src/app/api/payments/initiate/route.js
// Forwards the Bearer token from the browser to Laravel

export async function POST(request) {
  try {
    const body  = await request.json()
    const token = request.headers.get("Authorization") ?? ""

    const laravelRes = await fetch(
      `${process.env.LARAVEL_API_URL}/api/payments/initiate`,
      {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Accept":        "application/json",
          "Authorization": token,           // ← forward user's Bearer token
        },
        body: JSON.stringify(body),
      }
    )

    const rawText = await laravelRes.text()

    let data
    try {
      data = JSON.parse(rawText)
    } catch {
      console.error("[payments/initiate] Non-JSON from Laravel:", rawText.substring(0, 300))
      return Response.json(
        { error: `Laravel error (${laravelRes.status}): ${rawText.substring(0, 200)}` },
        { status: 502 }
      )
    }

    if (!laravelRes.ok) {
      return Response.json(
        { error: data.error ?? data.message ?? "Payment initiation failed" },
        { status: laravelRes.status }
      )
    }

    return Response.json(data)

  } catch (err) {
    console.error("[payments/initiate]", err)
    return Response.json({ error: err.message }, { status: 502 })
  }
}