import { RoadmapPageController } from "../_roadmap/RoadmapPageController";
import { createOwnerRoadmapViewModel } from "../../features/media/application/retained-media-page-service";

export default function RoadmapPage() {
  const viewModel = createOwnerRoadmapViewModel();
  return <RoadmapPageController approvedHtml={viewModel.approvedHtml} qaPanelHtml={viewModel.qaPanelHtml} />;
}
