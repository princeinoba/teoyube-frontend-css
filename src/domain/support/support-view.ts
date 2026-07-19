export type SupportViewVisibility = "retained_public" | "owner_only" | "development_only";

export type SupportView = Readonly<{
  route: string;
  capability: string;
  visibility: SupportViewVisibility;
  normalNavigation: boolean;
  visualTreatment: "approved_shell_current_view" | "approved_owner_qa_view";
}>;

export function createSupportView(input: SupportView): SupportView {
  if ((input.visibility === "owner_only" || input.visibility === "development_only") && input.normalNavigation) {
    throw new Error(`${input.route} cannot appear in normal navigation.`);
  }
  return Object.freeze(input);
}
