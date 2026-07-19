import { TodayPageController } from "./_today/TodayPageController";
import { createApprovedTodayViewModel } from "@/features/today/legacy-adapter";

export default function HomePage() {
  return <TodayPageController initialViewModel={createApprovedTodayViewModel()} />;
}
