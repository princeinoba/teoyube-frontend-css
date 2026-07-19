import { EmbeddedVideosPageController } from "../_media/EmbeddedVideosPageController";
import { createEmbeddedVideosPageViewModel } from "../../features/media/application/retained-media-page-service";

export default function EmbeddedVideosPage() {
  return <EmbeddedVideosPageController initialViewModel={createEmbeddedVideosPageViewModel()} />;
}
