import { TestimonyPageController } from "../_testimony/TestimonyPageController";
import { createTestimonyPageViewModel } from "../../features/testimony/application/testimony-page-service";

export default function TestimonyPage() {
  return <TestimonyPageController initialViewModel={createTestimonyPageViewModel()} />;
}
