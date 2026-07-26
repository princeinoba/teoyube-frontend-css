import fs from "node:fs";
import path from "node:path";
import type { BrowserContext, Page } from "@playwright/test";
import {
  assertDisposableCandidatePath,
  candidateRoot,
  fixedTime,
  type ViewId,
  type ViewportName
} from "./config";

const deterministicInitScript = ({ now }: { now: string }) => {
  const fixedNow = new Date(now).valueOf();
  const NativeDate = Date;
  class FixedDate extends NativeDate {
    constructor(...args: ConstructorParameters<typeof Date>) {
      super(...(args.length ? args : [fixedNow]));
    }
    static now() {
      return fixedNow;
    }
  }
  Object.defineProperty(window, "Date", { value: FixedDate });

  let randomState = 0x6d2b79f5;
  Math.random = () => {
    randomState = Math.imul(randomState ^ (randomState >>> 15), randomState | 1);
    randomState ^= randomState + Math.imul(randomState ^ (randomState >>> 7), randomState | 61);
    return ((randomState ^ (randomState >>> 14)) >>> 0) / 4294967296;
  };

  window.setInterval = (() => 0) as typeof window.setInterval;
};

export interface LegacyDomSnapshot {
  view: string;
  bodyView: string;
  root: { tag: string; id: string; classes: string[] };
  elements: Array<{
    index: number;
    tag: string;
    id: string;
    classes: string[];
    role: string;
    ariaLabel: string;
    dataView: string;
    dataAction: string;
    text: string;
    src: string;
    href: string;
  }>;
}

export interface RichParityContract {
  orderedDom: unknown[];
  ids: string[];
  classLists: Array<{ path: string; classes: string[] }>;
  majorRegions: unknown[];
  assets: unknown[];
  visibleLabels: unknown[];
  interactiveControls: unknown[];
  focusOrder: unknown[];
  responsiveNavigation: unknown[];
}

export async function installDeterminism(context: BrowserContext, allowedOrigins: string[]): Promise<void> {
  await context.addInitScript(deterministicInitScript, { now: fixedTime });
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["data:", "blob:", "about:"].includes(url.protocol) || allowedOrigins.includes(url.origin)) {
      await route.continue();
      return;
    }
    await route.abort("blockedbyclient");
  });
}

export async function settlePage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const requestedImages = [...document.images].filter((image) => {
      const rect = image.getBoundingClientRect();
      return Boolean(image.currentSrc) && rect.width > 0 && rect.height > 0;
    });
    const backgroundImageUrls = new Set<string>();
    for (const element of document.querySelectorAll("*")) {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      for (const pseudo of [null, "::before", "::after"] as const) {
        const backgroundImage = getComputedStyle(element, pseudo).backgroundImage;
        for (const match of backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
          backgroundImageUrls.add(new URL(match[1] || "", window.location.href).href);
        }
      }
    }
    const requestedBackgroundImages = [...backgroundImageUrls].map((source) => {
      const image = new Image();
      image.src = source;
      return image.decode().catch(() => undefined);
    });
    await Promise.race([
      Promise.all([
        ...requestedImages.map((image) =>
          image.complete ? Promise.resolve() : image.decode().catch(() => undefined)
        ),
        ...requestedBackgroundImages
      ]),
      new Promise((resolve) => window.setTimeout(resolve, 2_500))
    ]);
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.caretColor = "transparent";
    for (const animation of document.getAnimations()) {
      try {
        animation.pause();
      } catch {
        // A browser-owned animation may not be pausable.
      }
    }
    for (const media of document.querySelectorAll("video, audio")) {
      try {
        media.pause();
        media.currentTime = 0;
      } catch {
        // Metadata may not be available; the static poster remains authoritative.
      }
    }
  });
  await page.waitForTimeout(200);
}

export async function openStaticView(page: Page, view: ViewId): Promise<void> {
  await page.evaluate((requestedView) => {
    const staticWindow = window as typeof window & {
      setView?: (viewId: string, options: { updateHash: boolean }) => void;
    };
    if (typeof staticWindow.setView !== "function") {
      throw new Error("window.setView is unavailable in the static runtime.");
    }
    staticWindow.setView(requestedView, { updateHash: false });
    window.scrollTo(0, 0);
  }, view);
  await page.waitForTimeout(450);
  await settlePage(page);
}

export async function captureLegacyDom(page: Page, view: ViewId): Promise<LegacyDomSnapshot> {
  return page.evaluate((requestedView) => {
    const root = document.getElementById(requestedView);
    if (!root) throw new Error(`Missing view root #${requestedView}.`);
    const elements = [root, ...root.querySelectorAll("*")];
    const normalize = (value: unknown) => String(value || "").replace(/\s+/g, " ").trim();
    return {
      view: requestedView,
      bodyView: document.body.dataset.view || "",
      root: {
        tag: root.tagName.toLowerCase(),
        id: root.id,
        classes: [...root.classList]
      },
      elements: elements.map((element, index) => ({
        index,
        tag: element.tagName.toLowerCase(),
        id: element.id || "",
        classes: [...element.classList],
        role: element.getAttribute("role") || "",
        ariaLabel: element.getAttribute("aria-label") || "",
        dataView: element.getAttribute("data-view") || "",
        dataAction: element.getAttribute("data-action") || "",
        text: normalize(element.childElementCount === 0 ? element.textContent : "").slice(0, 160),
        src: element.getAttribute("src") || "",
        href: element.getAttribute("href") || ""
      }))
    };
  }, view);
}

export async function captureRichContract(page: Page, rootSelector: string): Promise<RichParityContract> {
  return page.evaluate((selector) => {
    const root = document.querySelector(selector);
    if (!root) throw new Error(`Missing parity root: ${selector}`);
    const composedRoots = [
      document.querySelector("#primarySidebar"),
      document.querySelector("#mobileNavBackdrop"),
      document.querySelector("#mobileNavToggle"),
      document.querySelector(".top-action-bar"),
      root
    ].filter((element): element is Element => Boolean(element));
    const elements = [...new Set(composedRoots.flatMap((element) => [element, ...element.querySelectorAll("*")]))];
    const normalize = (value: unknown) => String(value || "").replace(/\s+/g, " ").trim();
    const round = (value: number) => Math.round(value * 10) / 10;
    const styleCache = new Map<Element, CSSStyleDeclaration>();
    const rectCache = new Map<Element, DOMRect>();
    const visibilityCache = new Map<Element, boolean>();
    const styleFor = (element: Element) => {
      const cached = styleCache.get(element);
      if (cached) return cached;
      const style = getComputedStyle(element);
      styleCache.set(element, style);
      return style;
    };
    const rectFor = (element: Element) => {
      const cached = rectCache.get(element);
      if (cached) return cached;
      const rect = element.getBoundingClientRect();
      rectCache.set(element, rect);
      return rect;
    };
    const visible = (element: Element) => {
      const cached = visibilityCache.get(element);
      if (cached !== undefined) return cached;
      const style = styleFor(element);
      const rect = rectFor(element);
      const result = style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      visibilityCache.set(element, result);
      return result;
    };
    const pathCache = new Map<Element, string>();
    const elementPath = (element: Element | null): string => {
      if (!element) return "";
      const cached = pathCache.get(element);
      if (cached !== undefined) return cached;
      let part = element.tagName.toLowerCase();
      if (element.id) {
        const result = `${part}#${element.id}`;
        pathCache.set(element, result);
        return result;
      }
      const parent = element.parentElement;
      if (parent) {
        const sameTag = [...parent.children].filter((child) => child.tagName === element.tagName);
        if (sameTag.length > 1) part += `:nth-of-type(${sameTag.indexOf(element) + 1})`;
      }
      const parentPath = parent && parent !== document.documentElement ? elementPath(parent) : "";
      const result = parentPath ? `${parentPath} > ${part}` : part;
      pathCache.set(element, result);
      return result;
    };
    const normalizeUrl = (value: string) => {
      if (!value || value === "none") return "";
      return value.replace(/url\(["']?([^"')]+)["']?\)/g, (_match, rawUrl: string) => {
        try {
          const url = new URL(rawUrl, location.href);
          return `url(${url.origin === location.origin ? `${url.pathname}${url.search}${url.hash}` : url.href})`;
        } catch {
          return `url(${rawUrl})`;
        }
      });
    };
    const geometry = (element: Element) => {
      const rect = rectFor(element);
      return { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height) };
    };
    const controlSelector =
      "a[href],button,input,select,textarea,summary,video[controls],audio[controls],[tabindex],[role=button],[role=tab],[role=link]";
    const controls = elements.filter((element) => element.matches(controlSelector) && visible(element));
    const focusable = controls.filter((element) => {
      const htmlElement = element as HTMLElement;
      return htmlElement.tabIndex >= 0 && !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true";
    });
    const majorSelector =
      "header,nav,main,aside,section,article,table,dialog,[role=dialog],[class*=hero],[class*=carousel],[class*=rail],[class*=drawer],[class*=modal],[class*=sidebar]";
    const majorRegions = elements.filter((element) => element.matches(majorSelector) && visible(element));
    const ignoredAttribute = (name: string) =>
      /^(data-(nextjs|react|test)|data-testid$|nonce$)/i.test(name) ||
      /^(data-)?(timestamp|generated-at)$/i.test(name);
    const assetRows: Array<Record<string, unknown>> = [];
    for (const element of elements) {
      const style = styleFor(element);
      const attributes = ["src", "srcset", "poster", "href", "xlink:href"]
        .map((name) => [name, element.getAttribute(name) || ""] as const)
        .filter(([, value]) => value && /\.(png|jpe?g|webp|gif|svg|mp4|webm|mov|ico)(\?|#|$)/i.test(value));
      const backgroundImage = normalizeUrl(style.backgroundImage);
      if (attributes.length || backgroundImage) {
        assetRows.push({
          path: elementPath(element),
          tag: element.tagName.toLowerCase(),
          attributes,
          backgroundImage
        });
      }
    }

    return {
      orderedDom: elements.map((element, index) => ({
        index,
        path: elementPath(element),
        parentPath: elementPath(element.parentElement),
        tag: element.tagName.toLowerCase(),
        id: element.id || "",
        classes: [...element.classList],
        role: element.getAttribute("role") || "",
        ariaLabel: element.getAttribute("aria-label") || "",
        attributes: [...element.attributes]
          .filter((attribute) => !ignoredAttribute(attribute.name))
          .map((attribute) => [attribute.name, normalize(attribute.value)]),
        hidden: !visible(element)
      })),
      ids: elements.map((element) => element.id).filter(Boolean),
      classLists: elements
        .filter((element) => element.classList.length > 0)
        .map((element) => ({ path: elementPath(element), classes: [...element.classList] })),
      majorRegions: majorRegions.map((element) => ({
        path: elementPath(element),
        tag: element.tagName.toLowerCase(),
        id: element.id || "",
        classes: [...element.classList],
        geometry: geometry(element)
      })),
      assets: assetRows,
      visibleLabels: elements
        .filter((element) => visible(element) && element.childElementCount === 0 && normalize(element.textContent))
        .map((element) => ({ path: elementPath(element), text: normalize(element.textContent).slice(0, 240) })),
      interactiveControls: controls.map((element) => ({
        path: elementPath(element),
        tag: element.tagName.toLowerCase(),
        id: element.id || "",
        classes: [...element.classList],
        role: element.getAttribute("role") || "",
        name: element.getAttribute("aria-label") || normalize(element.textContent).slice(0, 160),
        type: element.getAttribute("type") || "",
        href: element.getAttribute("href") || "",
        disabled: element.hasAttribute("disabled"),
        tabIndex: (element as HTMLElement).tabIndex,
        geometry: geometry(element)
      })),
      focusOrder: focusable
        .map((element, documentIndex) => ({
          path: elementPath(element),
          tabIndex: (element as HTMLElement).tabIndex,
          documentIndex
        }))
        .sort((left, right) => {
          const leftRank = left.tabIndex > 0 ? left.tabIndex : Number.MAX_SAFE_INTEGER;
          const rightRank = right.tabIndex > 0 ? right.tabIndex : Number.MAX_SAFE_INTEGER;
          return leftRank - rightRank || left.documentIndex - right.documentIndex;
        }),
      responsiveNavigation: elements
        .filter((element) => element.matches("nav,aside,[class*=nav],[class*=sidebar],[id*=Nav],[id*=nav]"))
        .map((element) => ({
          path: elementPath(element),
          visible: visible(element),
          geometry: geometry(element),
          labels: [...element.querySelectorAll("a,button")].map((item) => normalize(item.textContent)).filter(Boolean)
        }))
    };
  }, rootSelector);
}

export async function captureCandidate(
  page: Page,
  outputGroup: string,
  viewportName: ViewportName,
  view: ViewId,
  rootSelector: string
): Promise<{ screenshotPath: string; contractPath: string; domPath: string | null }> {
  const outputDirectory = path.join(candidateRoot, outputGroup, viewportName);
  assertDisposableCandidatePath(outputDirectory);
  fs.mkdirSync(outputDirectory, { recursive: true });
  const screenshotPath = path.join(outputDirectory, `${view}.png`);
  const contractPath = path.join(outputDirectory, `${view}.contract.json`);
  const domPath = viewportName === "desktop-wide" ? path.join(outputDirectory, `${view}.dom.json`) : null;

  await page.screenshot({ path: screenshotPath, fullPage: false });
  const contract = await captureRichContract(page, rootSelector);
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
  if (domPath) {
    const snapshot = await captureLegacyDom(page, view);
    fs.writeFileSync(domPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  }
  return { screenshotPath, contractPath, domPath };
}
