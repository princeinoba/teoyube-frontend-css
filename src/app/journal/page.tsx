import { ApprovedJournalView } from "../_journal/ApprovedJournalView";
import { createJournalPageViewModel } from "../../features/journal/application/journal-page-service";

export default function JournalPage() {
  return <ApprovedJournalView viewModel={createJournalPageViewModel()} />;
}
