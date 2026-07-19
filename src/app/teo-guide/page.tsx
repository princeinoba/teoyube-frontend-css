import { TeoGuidePageController } from "../_teo-guide/TeoGuidePageController";
import { createTeoGuidePageViewModel } from "../../features/teo-guide/application/teo-guide-page-service";

export default function TeoGuidePage() {
  return <TeoGuidePageController initialViewModel={createTeoGuidePageViewModel()} />;
}
