export const CAPABILITY_IDS = [
  "today",
  "search",
  "scripture",
  "promises",
  "prayer",
  "calling",
  "journey",
  "journal",
  "testimony",
  "book",
  "lexicon",
  "teo-guide",
  "media",
  "settings",
  "consent",
  "memory"
] as const;

export type CapabilityId = (typeof CAPABILITY_IDS)[number];

export type CapabilityActionMap = {
  today: "load" | "select-assignment" | "reflect";
  search: "submit" | "filter" | "paginate";
  scripture: "open-passage" | "inspect-context" | "navigate";
  promises: "search" | "filter" | "select-promise";
  prayer: "draft" | "edit" | "confirm" | "discard";
  calling: "evaluate" | "inspect-explanation" | "select-action";
  journey: "start" | "advance" | "pause" | "reflect";
  journal: "draft" | "edit" | "save" | "delete";
  testimony: "draft" | "edit" | "confirm" | "delete";
  book: "open-entry" | "filter" | "export";
  lexicon: "search" | "filter" | "open-term";
  "teo-guide": "submit" | "inspect-sources" | "reject";
  media: "play" | "pause" | "seek" | "select";
  settings: "review" | "change" | "undo";
  consent: "review" | "grant" | "withdraw";
  memory: "review" | "confirm-write" | "edit" | "delete" | "export";
};

export type CapabilityEvent<Id extends CapabilityId> = Readonly<{
  capability: Id;
  action: CapabilityActionMap[Id];
  payload?: Readonly<Record<string, unknown>>;
}>;

export type CapabilityViewModel<Id extends CapabilityId> = Readonly<{
  capability: Id;
  data: Readonly<Record<string, unknown>>;
}>;

export interface CapabilityPort<Id extends CapabilityId> {
  read(): CapabilityViewModel<Id>;
  dispatch(event: CapabilityEvent<Id>): void;
}

export interface CapabilityApplicationService<Id extends CapabilityId> {
  readonly capability: Id;
  getViewModel(): CapabilityViewModel<Id>;
  handle(event: CapabilityEvent<Id>): void;
}
