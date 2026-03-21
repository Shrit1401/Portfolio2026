import { NextResponse } from "next/server";
import getNowPlayingItem from "../../SpotifyAPI";

export async function GET() {
  try {
    const data = await getNowPlayingItem();
    return NextResponse.json(data === false ? null : data);
  } catch (error) {
    console.error("Spotify now-playing route:", error);
    return NextResponse.json(null);
  }
}
