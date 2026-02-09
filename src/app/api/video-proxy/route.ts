import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  const response = await fetch(url);
  if (!response.ok) {
    return new Response("Failed to fetch video", { status: response.status });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "video/mp4",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
