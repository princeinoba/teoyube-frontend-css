"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDailySpiritualLoop } from "@/features/journey/ui/DailySpiritualLoopProvider";
import type { CanonViewModel } from "@/features/scripture/canon-contracts";
import { APPROVED_VIEW_MARKUP } from "../_approved-source/approved-view-markup.generated";
import { ApprovedMigrationOverlays, type MigrationNotice } from "../_approved-source/ApprovedMigrationOverlays";
import { ApprovedCanonView } from "./ApprovedCanonView";

const canonTabs = APPROVED_VIEW_MARKUP.canon.tabs as Readonly<Record<string, string>>;
const canonPages = APPROVED_VIEW_MARKUP.canon.pages as Readonly<Record<string, string>>;
const featuredImages = Array.from({ length: 8 }, (_, index) => `public/images/canon/featured-carousel/canon-featured-slide-0${index + 1}.png`);
const recommendedImages = Array.from({ length: 6 }, (_, index) => `public/images/canon/recommended-carousel/canon-recommended-slide-0${index + 1}.png`);
const watchmanImages = Array.from({ length: 7 }, (_, index) => `public/images/canon/watchman-carousel/canon-watchman-slide-0${index + 1}.png`);

function circularIndex(index: number, length: number) { return ((index % length) + length) % length; }

function updateCarousel(root: HTMLElement, kind: "featured" | "recommended" | "watchman", requestedIndex: number) {
  const definitions = kind === "featured"
    ? { host: "[data-canon-featured-carousel]", dots: "[data-canon-featured-slide-index]", attr: "data-canon-featured-slide-index", images: featuredImages, variable: "--canon-featured-image" }
    : kind === "recommended"
      ? { host: "[data-canon-recommended-carousel]", dots: "[data-canon-recommended-index]", attr: "data-canon-recommended-index", images: recommendedImages, variable: "--canon-recommended-image" }
      : { host: ".canon-watchman-story-card", dots: "[data-watchman-video-index]", attr: "data-watchman-video-index", images: watchmanImages, variable: "--watchman-image" };
  const host = root.querySelector<HTMLElement>(definitions.host);
  if (!host) return;
  const index = circularIndex(requestedIndex, definitions.images.length);
  host.style.setProperty(definitions.variable, `url('${definitions.images[index]}')`);
  host.querySelectorAll<HTMLButtonElement>(definitions.dots).forEach((button) => {
    const active = Number(button.getAttribute(definitions.attr)) === index;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "true" : "false");
  });
  host.dataset.activeIndex = String(index);
}

function currentCarouselIndex(host: Element | null) { return Number((host as HTMLElement | null)?.dataset.activeIndex || 0); }

export function CanonPageController({ initialViewModel }: { initialViewModel: CanonViewModel }) {
  const [html, setHtml] = useState(initialViewModel.approvedHtml);
  const [notice, setNotice] = useState<MigrationNotice>(null);
  const rootRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { state: dailySpiritualLoop, act: actOnDailySpiritualLoop } = useDailySpiritualLoop();
  const scriptureMomentActive = dailySpiritualLoop?.active && dailySpiritualLoop.currentStage === "scripture";

  useEffect(() => {
    const currentRoot = rootRef.current;
    if (!currentRoot) return;
    const root: HTMLElement = currentRoot;
    const continuationButton = [...root.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent?.includes("Continue Your Journey"));
    if (scriptureMomentActive) continuationButton?.setAttribute("data-daily-journey-action", "accept");

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.closest('[data-daily-journey-action="accept"]')) {
        const selected = root.querySelector<HTMLElement>("[data-canon-item].active") || root.querySelector<HTMLElement>("[data-canon-item]");
        actOnDailySpiritualLoop({ type: "accept", userInput: selected?.textContent?.trim() || "Scripture selection reviewed in Canon." });
        router.push("/promise-table");
        return;
      }
      const tab = target.closest<HTMLElement>("[data-canon-tab]");
      if (tab) {
        const tabId = tab.dataset.canonTab || "";
        const next = canonTabs[tabId];
        if (next) setHtml(next);
        return;
      }
      const page = target.closest<HTMLElement>("[data-canon-page]");
      if (page && !page.hasAttribute("disabled")) {
        const next = canonPages[page.dataset.canonPage || ""];
        if (next) setHtml(next);
        return;
      }
      const featuredDot = target.closest<HTMLElement>("[data-canon-featured-slide-index]");
      if (featuredDot) { updateCarousel(root, "featured", Number(featuredDot.dataset.canonFeaturedSlideIndex)); return; }
      const featuredNav = target.closest<HTMLElement>("[data-canon-featured-slide-nav]");
      if (featuredNav) {
        const host = featuredNav.closest("[data-canon-featured-carousel]");
        updateCarousel(root, "featured", currentCarouselIndex(host) + (featuredNav.dataset.canonFeaturedSlideNav === "next" ? 1 : -1));
        return;
      }
      const recommendedDot = target.closest<HTMLElement>("[data-canon-recommended-index]");
      if (recommendedDot) { updateCarousel(root, "recommended", Number(recommendedDot.dataset.canonRecommendedIndex)); return; }
      const recommendedNav = target.closest<HTMLElement>("[data-canon-recommended-nav]");
      if (recommendedNav) {
        const host = recommendedNav.closest("[data-canon-recommended-carousel]");
        updateCarousel(root, "recommended", currentCarouselIndex(host) + (recommendedNav.dataset.canonRecommendedNav === "next" ? 1 : -1));
        return;
      }
      const watchmanDot = target.closest<HTMLElement>("[data-watchman-video-index]");
      if (watchmanDot) { updateCarousel(root, "watchman", Number(watchmanDot.dataset.watchmanVideoIndex)); return; }
      const watchmanNav = target.closest<HTMLElement>("[data-watchman-video-nav]");
      if (watchmanNav) {
        const host = watchmanNav.closest(".canon-watchman-story-card");
        updateCarousel(root, "watchman", currentCarouselIndex(host) + (watchmanNav.dataset.watchmanVideoNav === "next" ? 1 : -1));
        return;
      }
      const quickChip = target.closest<HTMLButtonElement>(".canon-quick-chips button");
      if (quickChip) {
        const input = root.querySelector<HTMLInputElement>(".canon-hero-search input");
        if (input) { input.value = quickChip.textContent?.trim() || ""; input.focus(); }
        return;
      }
      const card = target.closest<HTMLElement>("[data-canon-item]");
      if (card) {
        root.querySelectorAll("[data-canon-item].active").forEach((item) => item.classList.remove("active"));
        card.classList.add("active");
      }
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement;
      if (!form.matches(".canon-hero-search")) return;
      event.preventDefault();
      const query = form.querySelector<HTMLInputElement>("input")?.value.trim() || "";
      setNotice({ title: "Canon search ready", detail: query || "Browse the approved Canon paths.", scripture: "Ephesians 1:18" });
    }

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const featured = target.closest("[data-canon-featured-carousel]");
      const recommended = target.closest("[data-canon-recommended-carousel]");
      if (!featured && !recommended) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const kind = featured ? "featured" : "recommended";
      updateCarousel(root, kind, currentCarouselIndex(featured || recommended) + (event.key === "ArrowRight" ? 1 : -1));
    }

    root.addEventListener("click", onClick);
    root.addEventListener("submit", onSubmit);
    root.addEventListener("keydown", onKeyDown);
    const timer = window.setInterval(() => {
      updateCarousel(root, "featured", currentCarouselIndex(root.querySelector("[data-canon-featured-carousel]")) + 1);
      updateCarousel(root, "recommended", currentCarouselIndex(root.querySelector("[data-canon-recommended-carousel]")) + 1);
    }, 7000);
    return () => {
      window.clearInterval(timer);
      root.removeEventListener("click", onClick);
      root.removeEventListener("submit", onSubmit);
      root.removeEventListener("keydown", onKeyDown);
    };
  }, [actOnDailySpiritualLoop, html, router, scriptureMomentActive]);

  return <><ApprovedCanonView html={html} rootRef={rootRef} /><ApprovedMigrationOverlays notice={notice} clearNotice={() => setNotice(null)} /></>;
}
