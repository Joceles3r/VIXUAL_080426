import { NextRequest, NextResponse } from "next/server"

const USER = process.env.VIXUAL_PREVIEW_USER
const PASS = process.env.VIXUAL_PREVIEW_PASSWORD

export function proxy(req: NextRequest) {
  if (!USER || !PASS) {
    return NextResponse.next()
  }

  const auth = req.headers.get("authorization")

  if (auth?.startsWith("Basic ")) {
    const encoded = auth.split(" ")[1]

    try {
      const [user, pass] = atob(encoded).split(":")

      if (user === USER && pass === PASS) {
        const response = NextResponse.next()
        response.headers.set("X-Robots-Tag", "noindex, nofollow")
        return response
      }
    } catch {
      // Invalid basic auth header
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
}
