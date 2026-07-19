import { ApprovedJourneyView } from "../_journey/ApprovedJourneyView";
import { createJourneyPageViewModel } from "../../features/journey/application/journey-service";

export default function JourneyPage() {
  return <ApprovedJourneyView viewModel={createJourneyPageViewModel()} />;
}
