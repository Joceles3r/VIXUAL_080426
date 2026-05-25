import { NextRequest, NextResponse } from "next/server"

const USER = process.env.VIXUAL_PREVIEW_USER
const PASS = process.env.VIXUAL_PREVIEW_PASSWORD

export function proxy(req: NextRequest) {
  const url = req.nextUrl.pathname

  if (
    url.startsWith("/_next") ||
    url === "/favicon.ico" ||
    url === "/robots.txt"
  ) {
    return NextResponse.next()
  }

  if (!USER || !PASS) {
    return NextResponse.next()
  }

  const auth = req.headers.get("authorization")

  if (auth?.startsWith("Basic ")) {
    const encoded = auth.split(" ")[1]
    const decoded = Buffer.from(encoded, "base64").toString("utf-8")
    const [user, pass] = decoded.split(":")

    if (user === USER && pass === PASS) {
      const response = NextResponse.next()
      response.headers.set("X-Robots-Tag", "noindex, nofollow")
      return response
    }
  }

  return new NextResponse("VIXUAL Preview Protected", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="VIXUAL Preview"',
      "X-Robots-Tag": "noindex, nofollow",
    },
  })
}

export const config = {
  matcher: ["/:path*"],
}
