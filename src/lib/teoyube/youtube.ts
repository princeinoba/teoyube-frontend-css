const TEOYUBE_HANDLE = "@TeoyubeWorld";

export type CompassVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
};

export async function getTeoyubeWorldChannelId() {
  return "";
}

export async function searchTeoyubeWorldVideos(query = "TeoyubeWorld") {
  const searchQuery = query.trim() || "TeoyubeWorld";

  return [
    {
      id: "",
      title: "Compass video lookup disabled",
      description: `The Compass topic "${searchQuery}" was received, but external YouTube lookup is disabled for this local app verification pass. Use the Calling Engine context on this page for Scripture-anchored reflection.`,
      thumbnail: "",
      channelTitle: TEOYUBE_HANDLE,
      publishedAt: ""
    }
  ];
}
