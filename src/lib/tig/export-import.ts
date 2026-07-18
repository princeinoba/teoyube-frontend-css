import {
  loadTIGActivities,
  loadTIGJournalEntries,
  clearTIGActivityStore,
  clearTIGJournalStore
} from "./persistence";
import type { TIGUserActivity } from "./user-activity";
import { saveTIGUserActivity } from "./user-activity";
import type { TIGJournalEntry } from "./journal";
import { saveTIGJournalEntry } from "./journal";

export type TIGExportBundle = {
  version: string;
  exportedAt: string;
  source: "teoyube-local";
  activities: TIGUserActivity[];
  journalEntries: TIGJournalEntry[];
};

export type TIGImportResult = {
  success: boolean;
  importedActivities: number;
  importedJournalEntries: number;
  error?: string;
};

export function createTIGExportBundle(): TIGExportBundle {
  const activitiesResult = loadTIGActivities({ provider: "local" });
  const journalEntriesResult = loadTIGJournalEntries({ provider: "local" });

  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    source: "teoyube-local",
    activities: activitiesResult.success ? activitiesResult.data || [] : [],
    journalEntries: journalEntriesResult.success ? journalEntriesResult.data || [] : []
  };
}

export function downloadTIGExport(filename = "teoyube-tig-export.json"): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const bundle = createTIGExportBundle();
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function validateTIGImportBundle(data: unknown): data is TIGExportBundle {
  if (!isRecord(data)) return false;

  return (
    typeof data.version === "string" &&
    Array.isArray(data.activities) &&
    Array.isArray(data.journalEntries)
  );
}

export function importTIGExportBundle(
  bundle: TIGExportBundle,
  options?: { replaceExisting?: boolean }
): TIGImportResult {
  try {
    if (options?.replaceExisting) {
      clearTIGActivityStore({ provider: "local" });
      clearTIGJournalStore({ provider: "local" });
    }

    for (const activity of bundle.activities) {
      saveTIGUserActivity(activity);
    }

    for (const journalEntry of bundle.journalEntries) {
      saveTIGJournalEntry(journalEntry);
    }

    return {
      success: true,
      importedActivities: bundle.activities.length,
      importedJournalEntries: bundle.journalEntries.length
    };
  } catch (error) {
    return {
      success: false,
      importedActivities: 0,
      importedJournalEntries: 0,
      error: error instanceof Error ? error.message : "Failed to import TIG export bundle."
    };
  }
}

export function parseAndImportTIGExport(
  json: string,
  options?: { replaceExisting?: boolean }
): TIGImportResult {
  try {
    const parsed = JSON.parse(json);

    if (!validateTIGImportBundle(parsed)) {
      return {
        success: false,
        importedActivities: 0,
        importedJournalEntries: 0,
        error: "Invalid TIG export bundle."
      };
    }

    return importTIGExportBundle(parsed, options);
  } catch (error) {
    return {
      success: false,
      importedActivities: 0,
      importedJournalEntries: 0,
      error: error instanceof Error ? error.message : "Failed to parse TIG export JSON."
    };
  }
}
