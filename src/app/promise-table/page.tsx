import { PromiseTablePageController } from "../_promise-table/PromiseTablePageController";
import { createApprovedPromiseTableViewModel } from "@/features/promises/application/promise-table-service";
import { createLocalPromiseRepository } from "@/features/promises/infrastructure/local-promise-repository";

export default function PromiseTablePage() {
  return <PromiseTablePageController initialViewModel={createApprovedPromiseTableViewModel(createLocalPromiseRepository())} />;
}
