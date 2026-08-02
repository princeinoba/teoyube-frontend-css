"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TablesPageViewModel } from "../../features/media/application/retained-media-page-service";
import { createTablesYouTubePlayback } from "../../features/media/tables-youtube-player.js";
import tablesYouTubeFeed from "../../features/promises/promise-table-youtube-feed.json";
import { ApprovedMigrationOverlays, type MigrationNotice } from "../_approved-source/ApprovedMigrationOverlays";
import { ApprovedTablesView } from "./ApprovedTablesView";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function TablesPageController({ initialViewModel }: { initialViewModel: TablesPageViewModel }) {
  const rootRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const [notice, setNotice] = useState<MigrationNotice>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const playback = createTablesYouTubePlayback(root, tablesYouTubeFeed);
    return () => playback.destroy();
  }, []);

  useEffect(() => {
    const mountedRoot = rootRef.current;
    if (!mountedRoot) return;
    const root: HTMLElement = mountedRoot;

    function applyDemoFilter() {
      const query = normalize(root?.querySelector<HTMLInputElement>("#teoyubeTableSearch")?.value || "");
      const category = normalize(root?.querySelector<HTMLSelectElement>("#teoyubeTableCategory")?.value || "all categories");
      const rows = [...(root?.querySelectorAll<HTMLTableRowElement>("#teoyubeTablesRows .teoyube-main-row") || [])];
      rows.forEach((row) => {
        const detail = row.nextElementSibling as HTMLElement | null;
        const text = normalize(`${row.textContent || ""} ${detail?.textContent || ""}`);
        const matches = (!query || text.includes(query)) && (category === "all categories" || text.includes(category));
        row.hidden = !matches;
        if (detail) detail.hidden = !matches || !row.classList.contains("expanded");
      });
    }

    function applyManagementTab(tabId: string) {
      const captured = initialViewModel.managementTabs[tabId];
      if (!captured) return;
      const rows = root?.querySelector<HTMLElement>("#teoyubeDataTableRows");
      const pagination = root?.querySelector<HTMLElement>("#teoyubeDataTablePagination");
      const status = root?.querySelector<HTMLElement>("#teoyubeDataTableStatus");
      const source = root?.querySelector<HTMLElement>("#teoyubeDataVideoSourceWrap");
      if (rows) rows.innerHTML = captured.rows;
      if (pagination) pagination.innerHTML = captured.pagination;
      if (status) status.textContent = captured.status || "";
      if (source) source.hidden = captured.videoSourceHidden;
      root?.querySelectorAll<HTMLElement>("#teoyubeDataTableTabs [data-data-table-tab]").forEach((button) => {
        const active = button.dataset.dataTableTab === tabId;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
    }

    function applyDataSearch() {
      const query = normalize(root?.querySelector<HTMLInputElement>("#teoyubeDataTableSearch")?.value || "");
      root?.querySelectorAll<HTMLTableRowElement>("#teoyubeDataTableRows tr").forEach((row) => { row.hidden = Boolean(query) && !normalize(row.textContent || "").includes(query); });
    }

    function onInput(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.id === "teoyubeTableSearch") applyDemoFilter();
      if (target.id === "teoyubeDataTableSearch") applyDataSearch();
    }

    function onChange(event: Event) {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      if (target.id === "teoyubeTableCategory") applyDemoFilter();
      if (target.matches("[data-table-select]")) target.closest(".teoyube-main-row")?.classList.toggle("selected", (target as HTMLInputElement).checked);
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const page = target.closest<HTMLElement>("#teoyubeTablePagination [data-table-page]");
      if (page) {
        const captured = initialViewModel.pages[page.dataset.tablePage || ""];
        if (captured) root.innerHTML = captured;
        return;
      }
      const tab = target.closest<HTMLElement>("#teoyubeDataTableTabs [data-data-table-tab]");
      if (tab) { applyManagementTab(tab.dataset.dataTableTab || "promises"); return; }
      const rowToggle = target.closest<HTMLElement>("[data-table-row]");
      if (rowToggle) {
        const row = rowToggle.closest<HTMLTableRowElement>(".teoyube-main-row");
        const detail = row?.nextElementSibling as HTMLElement | null;
        const expanded = !row?.classList.contains("expanded");
        row?.classList.toggle("expanded", expanded);
        rowToggle.setAttribute("aria-expanded", String(expanded));
        if (detail) detail.hidden = !expanded;
        return;
      }
      const demoAction = target.closest<HTMLElement>("[data-table-demo-action]");
      if (demoAction) {
        if (demoAction.dataset.tableDemoAction === "details") demoAction.closest("tr")?.querySelector<HTMLElement>("[data-table-row]")?.click();
        if (demoAction.dataset.tableDemoAction === "filter") {
          const select = root.querySelector<HTMLSelectElement>("#teoyubeTableCategory");
          if (select) select.value = "Promise";
          applyDemoFilter();
        }
        if (demoAction.dataset.tableDemoAction === "save") setNotice({ title: "Table row saved to Book", detail: "Session-only and reversible; no durable write occurred." });
        return;
      }
      if (target.closest("[data-table-video-play], [data-table-preview-video-play], .table-preview-video-panel")) {
        target.closest<HTMLElement>(".table-row-video, .table-preview-video-panel")?.classList.add("playing");
        setNotice({ title: "Local table media preview", detail: "Playback remains local; no external source or protected path was exposed." });
        return;
      }
      const dataAction = target.closest<HTMLElement>("[data-data-table-action]");
      if (dataAction) {
        setNotice({ title: dataAction.textContent?.trim() || "Table action ready", detail: "The action remains session-only, reversible, and source-linked." });
        return;
      }
      if (target.closest("#teoyubeTableFiltersButton")) root.querySelector<HTMLInputElement>("#teoyubeTableSearch")?.focus();
      const shortcut = target.closest<HTMLElement>("[data-view-shortcut]");
      if (shortcut?.dataset.viewShortcut === "today") router.push("/");
    }

    root.addEventListener("input", onInput);
    root.addEventListener("change", onChange);
    root.addEventListener("click", onClick);
    return () => { root.removeEventListener("input", onInput); root.removeEventListener("change", onChange); root.removeEventListener("click", onClick); };
  }, [initialViewModel, router]);

  return <><ApprovedTablesView html={initialViewModel.approvedHtml} rootRef={rootRef} /><ApprovedMigrationOverlays notice={notice} clearNotice={() => setNotice(null)} /></>;
}
