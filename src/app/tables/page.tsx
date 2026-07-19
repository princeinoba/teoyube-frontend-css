import { TablesPageController } from "../_media/TablesPageController";
import { createTablesPageViewModel } from "../../features/media/application/retained-media-page-service";

export default function TablesPage() {
  return <TablesPageController initialViewModel={createTablesPageViewModel()} />;
}
