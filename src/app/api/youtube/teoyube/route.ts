import { NextResponse } from "next/server";
import { searchTeoyubeWorldVideos } from "@/lib/youtube";

const fallbackVideos = [
  {
    id: "",
    title: "Compass video lookup disabled",
    description:
      "External YouTube lookup is disabled for this local app verification pass. Use the Calling Engine context on the Compass page for Scripture-anchored reflection.",
    thumbnail: "",
    channelTitle: "TeoyubeWorld",
    publishedAt: ""
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "TeoyubeWorld";

  try {
    const videos = await searchTeoyubeWorldVideos(query);
    return NextResponse.json({ videos, query });
  } catch (error) {
    return NextResponse.json(
      {
        videos: fallbackVideos,
        query,
        error:
          error instanceof Error
            ? error.message
            : "Compass video lookup is disabled for local verification."
      },
      { status: 200 }
    );
  }
}
