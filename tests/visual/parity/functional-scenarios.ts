import type { Page } from "@playwright/test";
import type { ViewId, ViewportName } from "./config";

type FunctionalCategory =
  | "navigation"
  | "carousel"
  | "search"
  | "filters"
  | "tabs"
  | "pagination"
  | "modal-drawer"
  | "primary-action"
  | "media-controls"
  | "keyboard-navigation"
  | "responsive-navigation";

type FunctionalAction =
  | { kind: "click"; selector: string }
  | { kind: "fill"; selector: string; value: string }
  | { kind: "select-index"; selector: string; index: number }
  | { kind: "press"; selector: string; key: string };

export interface FunctionalScenario {
  id: string;
  category: FunctionalCategory;
  view: ViewId;
  viewports: ViewportName[];
  actions: FunctionalAction[];
  observe: string[];
}

const desktop: ViewportName[] = ["desktop-wide"];
const mobile: ViewportName[] = ["mobile", "mobile-small"];

export const functionalScenarios: FunctionalScenario[] = [
  {
    id: "primary-navigation-to-search",
    category: "navigation",
    view: "today",
    viewports: desktop,
    actions: [{ kind: "click", selector: "#primarySidebar [data-view='search']" }],
    observe: ["body", "#search"]
  },
  {
    id: "today-carousel-next",
    category: "carousel",
    view: "today",
    viewports: desktop,
    actions: [{ kind: "click", selector: "#carouselNext" }],
    observe: ["#promiseCarouselTrack", "#promiseCarouselDots"]
  },
  {
    id: "promise-search-submission",
    category: "search",
    view: "search",
    viewports: desktop,
    actions: [
      { kind: "fill", selector: "#teoyubeSearchInput", value: "calling" },
      { kind: "press", selector: "#teoyubeSearchInput", key: "Enter" }
    ],
    observe: ["#search"]
  },
  {
    id: "lexicon-category-filter",
    category: "filters",
    view: "lexicon",
    viewports: desktop,
    actions: [{ kind: "select-index", selector: "#lexiconCategoryFilter", index: 1 }],
    observe: ["#lexicon"]
  },
  {
    id: "canon-tab-selection",
    category: "tabs",
    view: "canon",
    viewports: desktop,
    actions: [{ kind: "click", selector: "#canonTabs .canon-tab:not(.active)" }],
    observe: ["#canonTabs", "#canon"]
  },
  {
    id: "tables-pagination",
    category: "pagination",
    view: "teoyube-tables",
    viewports: desktop,
    actions: [{ kind: "click", selector: "#teoyubeTablePagination [data-table-page='2']" }],
    observe: ["#teoyubeTablePagination", "#teoyubeTableBody"]
  },
  {
    id: "guardrails-modal",
    category: "modal-drawer",
    view: "today",
    viewports: desktop,
    actions: [{ kind: "click", selector: "#privacyBtn" }],
    observe: ["#guardrailDialog"]
  },
  {
    id: "promise-detail-drawer",
    category: "modal-drawer",
    view: "table",
    viewports: desktop,
    actions: [{ kind: "click", selector: "[data-phase116b-action='promise-detail']" }],
    observe: ["#table .phase116b-detail-drawer"]
  },
  {
    id: "today-primary-action",
    category: "primary-action",
    view: "today",
    viewports: desktop,
    actions: [{ kind: "click", selector: "#today .action-icon-button.primary" }],
    observe: ["body", "main"]
  },
  {
    id: "embedded-media-preview",
    category: "media-controls",
    view: "ui-elements",
    viewports: desktop,
    actions: [{ kind: "click", selector: "#ui-elements .embedded-video-play" }],
    observe: ["#ui-elements video", "#ui-elements iframe", "#ui-elements [class*=video]"]
  },
  {
    id: "carousel-keyboard-next",
    category: "keyboard-navigation",
    view: "today",
    viewports: desktop,
    actions: [{ kind: "press", selector: "#todayPromiseCarousel", key: "ArrowRight" }],
    observe: ["#promiseCarouselTrack", "#promiseCarouselDots"]
  },
  {
    id: "mobile-navigation-open",
    category: "responsive-navigation",
    view: "today",
    viewports: mobile,
    actions: [{ kind: "click", selector: "#mobileNavToggle" }],
    observe: ["#mobileNavToggle", "#primarySidebar", "#mobileNavBackdrop"]
  }
];

async function fingerprint(page: Page, selectors: string[]): Promise<unknown[]> {
  return page.evaluate((requestedSelectors) => {
    const normalize = (value: unknown) => String(value || "").replace(/\s+/g, " ").trim();
    return requestedSelectors.map((selector) => {
      const matches = [...document.querySelectorAll(selector)];
      return {
        selector,
        matches: matches.map((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            id: element.id || "",
            classes: [...element.classList],
            role: element.getAttribute("role") || "",
            ariaSelected: element.getAttribute("aria-selected") || "",
            ariaExpanded: element.getAttribute("aria-expanded") || "",
            open: element.hasAttribute("open"),
            hidden: element.hasAttribute("hidden") || style.display === "none" || style.visibility === "hidden",
            text: normalize(element.textContent).slice(0, 240),
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10
          };
        })
      };
    });
  }, selectors);
}

export async function runFunctionalScenario(page: Page, scenario: FunctionalScenario): Promise<unknown> {
  const before = await fingerprint(page, scenario.observe);
  for (const action of scenario.actions) {
    const locator = page.locator(action.selector).first();
    await locator.waitFor({ state: "attached" });
    if (action.kind === "click") await locator.click();
    if (action.kind === "fill") await locator.fill(action.value);
    if (action.kind === "select-index") await locator.selectOption({ index: action.index });
    if (action.kind === "press") {
      await locator.focus();
      await locator.press(action.key);
    }
  }
  await page.waitForTimeout(100);
  const after = await fingerprint(page, scenario.observe);
  return { id: scenario.id, category: scenario.category, before, after };
}
