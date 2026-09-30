import { NextResponse } from "next/server";
import { getNowPlaying } from "@/app/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getNowPlaying());
}
