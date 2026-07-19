"use client";

import { useEffect, useRef, useState } from "react";
import { createDeterministicTeoGuideMessage, type TeoGuideMessage } from "../../domain/teo-guide/teo-guide-message";
import type { TeoGuidePageViewModel } from "../../features/teo-guide/application/teo-guide-page-service";
import { ApprovedMigrationOverlays, type MigrationNotice } from "../_approved-source/ApprovedMigrationOverlays";
import { ApprovedTeoGuideView } from "./ApprovedTeoGuideView";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] || character));
}

function renderUserMessage(text: string) {
  return `<div class="message-row user"><span class="message-icon" aria-hidden="true"></span><div class="message user" aria-label="Your message">${escapeHtml(text)}</div></div>`;
}

function renderGuideMessage(message: TeoGuideMessage) {
  const reference = message.sources[0]?.reference || "Psalm 119:105";
  return `<div class="message-row teo"><span class="message-icon" aria-hidden="true"></span><div class="message teo" aria-label="Teo Guide response">${escapeHtml(message.text)}</div><details class="phase116-why-this-panel"><summary><span>Why this?</span><strong>Scripture anchored</strong></summary><div class="phase116-why-grid"><article><span>Scripture</span><strong>${escapeHtml(reference)}</strong></article><article><span>Interpretation</span><strong>${escapeHtml(message.interpretation)}</strong></article><article><span>Application</span><strong>${escapeHtml(message.suggestedApplication)}</strong></article><article><span>Confidence</span><strong>${escapeHtml(message.confidence)}</strong></article></div><p>Scripture remains the authority; Teoyube interpretation, prayer language, and suggested actions are devotional aids only.</p><p>${escapeHtml(message.limitation)}</p></details></div>`;
}

export function TeoGuidePageController({ initialViewModel }: { initialViewModel: TeoGuidePageViewModel }) {
  const rootRef = useRef<HTMLElement>(null);
  const originalChatRef = useRef("");
  const lastMessageRef = useRef(initialViewModel.initialMessage);
  const [notice, setNotice] = useState<MigrationNotice>(null);

  useEffect(() => {
    const mountedRoot = rootRef.current;
    const mountedChatLog = mountedRoot?.querySelector<HTMLElement>("#chatLog");
    if (!mountedRoot || !mountedChatLog) return;
    const root: HTMLElement = mountedRoot;
    const chatLog: HTMLElement = mountedChatLog;
    originalChatRef.current = chatLog.innerHTML;

    function submitPrompt(promptValue: string) {
      const prompt = promptValue.trim();
      if (!prompt) return;
      const message = createDeterministicTeoGuideMessage(prompt);
      lastMessageRef.current = message;
      chatLog.insertAdjacentHTML("beforeend", `${renderUserMessage(prompt)}${renderGuideMessage(message)}`);
      chatLog.scrollTop = chatLog.scrollHeight;
      const input = root.querySelector<HTMLInputElement>("#chatInput");
      if (input) input.value = "";
      setNotice({ title: "Teo Guide responded", detail: "Deterministic local Scripture guidance; no live AI or durable memory was used.", scripture: message.sources[0]?.reference });
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement;
      if (form.id !== "chatForm") return;
      event.preventDefault();
      submitPrompt(root?.querySelector<HTMLInputElement>("#chatInput")?.value || "");
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const prompt = target.closest<HTMLElement>(".prompt-chip[data-prompt]");
      if (prompt) {
        const input = root.querySelector<HTMLInputElement>("#chatInput");
        if (input) input.value = prompt.dataset.prompt || "";
        submitPrompt(prompt.dataset.prompt || "");
        return;
      }
      const action = target.closest<HTMLElement>("[data-phase116b-action]")?.dataset.phase116bAction;
      if (action === "teo-clear-chat") {
        chatLog.innerHTML = originalChatRef.current;
        setNotice({ title: "Chat cleared", detail: "The session-only conversation returned to its approved welcome state." });
        return;
      }
      if (action === "teo-copy-response") {
        navigator.clipboard?.writeText(lastMessageRef.current.text).catch(() => undefined);
        setNotice({ title: "Response ready to copy", detail: "Clipboard access was requested; no external service was contacted.", scripture: lastMessageRef.current.sources[0]?.reference });
        return;
      }
      if (action === "teo-save-response" || action === "teo-save-prayer" || action === "teo-add-reflection") {
        setNotice({ title: "Teo Guide session item ready", detail: "Session-only and reversible; no silent durable write occurred.", scripture: lastMessageRef.current.sources[0]?.reference });
        return;
      }
      if (target.closest(".guide-attach-button, .guide-mic-button")) setNotice({ title: target.getAttribute("aria-label") || "Guide control", detail: "This local preview does not upload, record, or contact an external model." });
    }

    root.addEventListener("submit", onSubmit);
    root.addEventListener("click", onClick);
    return () => { root.removeEventListener("submit", onSubmit); root.removeEventListener("click", onClick); };
  }, [initialViewModel]);

  return <><ApprovedTeoGuideView html={initialViewModel.approvedHtml} rootRef={rootRef} /><ApprovedMigrationOverlays notice={notice} clearNotice={() => setNotice(null)} /></>;
}
