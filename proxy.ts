import { NextRequest, NextResponse } from "next/server"

const USER = process.env.VIXUAL_PREVIEW_USER
const PASS = process.env.VIXUAL_PREVIEW_PASSWORD
const IS_RENDER = Boolean(process.env.RENDER)

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next()
  }

  // Si on est sur Render et que les credentials sont absents, bloquer avec erreur 500
  if (IS_RENDER && (!USER || !PASS)) {
    return new NextResponse("VIXUAL Preview credentials missing on Render", {
      status: 500,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
      },
    })
  }

  // En local sans credentials, laisser passer
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
}
