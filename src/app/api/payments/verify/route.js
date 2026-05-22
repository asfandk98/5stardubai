// src/app/api/payments/verify/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get("order_id")
  const token   = request.headers.get("Authorization") ?? ""

  if (!orderId) {
    return Response.json({ error: "Missing order_id" }, { status: 400 })
  }

  try {
    const laravelRes = await fetch(
      `${process.env.LARAVEL_API_URL}/api/payments/verify?order_id=${orderId}`,
      {
        headers: {
          "Accept":        "application/json",
          "Authorization": token,
        },
      }
    )
    const data = await laravelRes.json()
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: "Verification failed: " + err.message }, { status: 502 })
  }
}