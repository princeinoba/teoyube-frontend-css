import { ApprovedPrayerView } from "../_prayer/ApprovedPrayerView";
import { createPrayerPageViewModel } from "../../features/prayer/application/prayer-service";

export default function PrayerPage() {
  return <ApprovedPrayerView viewModel={createPrayerPageViewModel()} />;
}
