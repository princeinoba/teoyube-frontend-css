import { CanonPageController } from "../_canon/CanonPageController";
import { createApprovedCanonViewModel } from "@/features/scripture/application/canon-service";
import { createLocalScriptureRepository } from "@/features/scripture/infrastructure/local-scripture-repository";
import { createLocalPromiseRepository } from "@/features/promises/infrastructure/local-promise-repository";

export default function CanonPage() {
  return <CanonPageController initialViewModel={createApprovedCanonViewModel(createLocalScriptureRepository(), createLocalPromiseRepository())} />;
}
