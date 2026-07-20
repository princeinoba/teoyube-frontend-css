"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDailySpiritualLoop } from "@/features/journey/ui/DailySpiritualLoopProvider";

const NAVIGATION = [
  { view: "today", label: "Today", href: "/" },
  { view: "search", label: "TeoyubeSearch", href: "/search" },
  { view: "canon", label: "Canon", href: "/canon" },
  { view: "table", label: "Promise Table", href: "/promise-table" },
  { view: "calling", label: "Calling Compass", href: "/calling-compass" },
  { view: "book", label: "Book of the Saint", href: "/book" },
  { view: "lexicon", label: "Lexicon", href: "/lexicon" },
  { view: "testimony", label: "Testimony", href: "/testimony" },
  { view: "guide", label: "Teo Guide", href: "/teo-guide" },
  { view: "ui-elements", label: "Embedded Videos", href: "/embedded-videos" },
  { view: "teoyube-tables", label: "Tables", href: "/tables" }
] as const;

const VIEW_TITLES: Readonly<Record<string, string>> = {
  today: "Today's Promise Animation",
  roadmap: "Implementation Roadmap",
  search: "TeoyubeSearch",
  canon: "Teoyube Canon",
  table: "Promise Table",
  calling: "Calling Compass",
  book: "Book of the Saint",
  lexicon: "Teoyube Lexicon",
  testimony: "Testimony Archive",
  guide: "Teo Guide",
  "ui-elements": "Embedded Videos",
  "teoyube-tables": "Tables"
};

function getView(pathname: string): string {
  if (pathname === "/") return "today";
  if (pathname === "/search" || pathname === "/promise-search") return "search";
  if (pathname === "/promise-table") return "table";
  if (pathname === "/calling-compass" || pathname === "/compass") return "calling";
  if (pathname === "/teo-guide") return "guide";
  if (pathname === "/embedded-videos") return "ui-elements";
  if (pathname === "/tables") return "teoyube-tables";
  const candidate = pathname.slice(1).split("/")[0];
  return candidate in VIEW_TITLES ? candidate : "today";
}

export function ApprovedTeoyubeShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const view = getView(pathname);
  const { state: dailySpiritualLoop } = useDailySpiritualLoop();

  useEffect(() => {
    document.body.dataset.view = view;
  }, [view]);

  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", mobileOpen);
    return () => document.body.classList.remove("mobile-nav-open");
  }, [mobileOpen]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || !mobileOpen) return;
      setMobileOpen(false);
      mobileToggle.current?.focus();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  function closeMobileNavigation(returnFocus = true) {
    setMobileOpen(false);
    if (returnFocus) requestAnimationFrame(() => mobileToggle.current?.focus());
  }

  function navigate(href: string) {
    router.push(href);
    closeMobileNavigation(mobileOpen);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  return (
    <>
      <a className="skip-link" href="#appMain">Skip to main content</a>
      <div className="app-shell">
        <aside className="sidebar app-sidebar" id="primarySidebar" aria-label="Primary">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true"></div>
            <div>
              <p className="eyebrow">Ephesians 1:18</p>
              <h1>TEOYUBE</h1>
              <p className="brand-subtitle">Creative Digital Ministry</p>
            </div>
          </div>

          <nav className="nav-list">
            {NAVIGATION.map((item) => (
              <button
                className={`nav-item${view === item.view ? " active" : ""}`}
                data-view={item.view}
                key={item.view}
                onClick={() => navigate(item.href)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <section className="saint-card" aria-label="Saint profile">
            <div className="saint-profile-head">
              <span className="saint-avatar" aria-hidden="true"></span>
              <div>
                <p>Welcome back,</p>
                <h2 id="sidebarName">Saint</h2>
              </div>
              <span className="active-badge">Active</span>
            </div>
            <p id="sidebarCalling">Creative Digital Ministry - Active Assignment</p>
            <button className="secondary full" id="openAssessment" type="button" onClick={() => router.push("/calling-compass?assessment=1")}>Purpose Assessment</button>
            <button className="secondary full" id="openPersonalizationCenter" type="button" onClick={() => router.push("/personalization")}>Personalization Center</button>
          </section>
        </aside>
        <button
          className="mobile-nav-backdrop"
          id="mobileNavBackdrop"
          type="button"
          aria-label="Close navigation"
          hidden={!mobileOpen}
          onClick={() => closeMobileNavigation()}
        ></button>
        <button
          className="secondary action-icon-button mobile-nav-toggle"
          id="mobileNavToggle"
          type="button"
          aria-controls="primarySidebar"
          aria-expanded={mobileOpen}
          ref={mobileToggle}
          onClick={() => setMobileOpen((open) => !open)}
        ><span className="button-icon button-icon-menu" aria-hidden="true"></span><span>Menu</span></button>

        <main className="app-main" id="appMain" tabIndex={-1}>
          <header className="topbar app-header">
            <div>
              <p className="eyebrow">{"Where God's Promises Meet Your Calling"}</p>
              <h2 id="viewTitle">{VIEW_TITLES[view]}</h2>
            </div>
            <div className="topbar-actions">
              <button className="secondary action-icon-button" id="privacyBtn" onClick={() => router.push("/consent")}><span className="button-icon button-icon-guardrails" aria-hidden="true"></span><span>Guardrails</span></button>
              <button
                className="primary action-icon-button"
                id="generateBtn"
                data-daily-journey-navigation={dailySpiritualLoop?.active ? "progress" : undefined}
                onClick={() => dailySpiritualLoop?.active
                  ? navigate("/journey")
                  : view === "today"
                    ? document.dispatchEvent(new CustomEvent("teoyube:generate-today"))
                    : navigate("/")}
              ><span className="button-icon button-icon-journey" aria-hidden="true"></span><span>{dailySpiritualLoop?.active ? "Journey Progress" : "Generate Today's Journey"}</span></button>
            </div>
          </header>
          {children}
        </main>
      </div>
    </>
  );
}
