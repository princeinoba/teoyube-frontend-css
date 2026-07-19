import { SearchPageController } from "../_search/SearchPageController";
import { createApprovedSearchViewModel } from "@/features/search/legacy-adapter";

export default function SearchPage() {
  return <SearchPageController initialViewModel={createApprovedSearchViewModel()} />;
}
