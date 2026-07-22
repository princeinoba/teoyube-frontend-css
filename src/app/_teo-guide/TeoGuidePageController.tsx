"use client";

import { useEffect, useRef, useState } from "react";
import type { TeoGuideClientResponseDto } from "../../domain/teo-guide/teo-guide-client-dto";
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

function renderGuideMessage(message: TeoGuideMessage, client?: TeoGuideClientResponseDto) {
  const reference = message.sources[0]?.reference || "Psalm 119:105";
  const additional = (client?.sections || []).map((item) => `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.body)}</strong></article>`).join("");
  const safety = client?.safety.mode === "critical" ? client.safety.orderedGuidance.map((item) => `<p>${escapeHtml(item)}</p>`).join("") : "";
  const proposals = (client?.actionProposals || []).map((item) => `<p><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.summary)} Explicit confirmation is required; no state changed.</p>`).join("");
  const followUp = client?.followUp ? `<p><strong>One focused question:</strong> ${escapeHtml(client.followUp.question)}</p>` : "";
  return `<div class="message-row teo"><span class="message-icon" aria-hidden="true"></span><div class="message teo" aria-label="Teo Guide response">${escapeHtml(message.text)}</div><details class="phase116-why-this-panel"><summary><span>Why this?</span><strong>Scripture anchored</strong></summary>${safety}<div class="phase116-why-grid"><article><span>Scripture</span><strong>${escapeHtml(reference)}</strong></article><article><span>Interpretation</span><strong>${escapeHtml(message.interpretation)}</strong></article><article><span>Application</span><strong>${escapeHtml(message.suggestedApplication)}</strong></article><article><span>Confidence</span><strong>${escapeHtml(message.confidence)}</strong></article>${additional}</div><p>Scripture remains the authority; Teoyube interpretation, prayer language, and suggested actions are devotional aids only.</p><p>${escapeHtml(message.limitation)}</p>${followUp}${proposals}</details></div>`;
}

function isObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isClientResponse(value: unknown): value is TeoGuideClientResponseDto {
  if (!isObject(value) || !isObject(value.message) || !isObject(value.safety)) return false;
  return typeof value.responseId === "string"
    && typeof value.conversationId === "string"
    && typeof value.intent === "string"
    && typeof value.message.text === "string"
    && Array.isArray(value.message.sources)
    && Array.isArray(value.sections)
    && Array.isArray(value.whyThis)
    && Array.isArray(value.limitations)
    && Array.isArray(value.sourceReferences)
    && Array.isArray(value.actionProposals)
    && typeof value.safety.mode === "string"
    && value.safety.postValidationPassed === true
    && value.deterministic === true
    && value.externalModelUsed === false
    && value.durableWritePerformed === false;
}

export function TeoGuidePageController({ initialViewModel }: { initialViewModel: TeoGuidePageViewModel }) {
  const rootRef = useRef<HTMLElement>(null);
  const originalChatRef = useRef("");
  const lastMessageRef = useRef(initialViewModel.initialMessage);
  const conversationIdRef = useRef("");
  const requestGenerationRef = useRef(0);
  const [notice, setNotice] = useState<MigrationNotice>(null);

  useEffect(() => {
    const mountedRoot = rootRef.current;
    const mountedChatLog = mountedRoot?.querySelector<HTMLElement>("#chatLog");
    if (!mountedRoot || !mountedChatLog) return;
    const root: HTMLElement = mountedRoot;
    const chatLog: HTMLElement = mountedChatLog;
    originalChatRef.current = chatLog.innerHTML;
    if (!conversationIdRef.current) conversationIdRef.current = `teo-session-${crypto.randomUUID()}`;

    async function submitPrompt(promptValue: string) {
      const prompt = promptValue.trim();
      if (!prompt) return;
      const generation = ++requestGenerationRef.current;
      chatLog.insertAdjacentHTML("beforeend", renderUserMessage(prompt));
      const input = root.querySelector<HTMLInputElement>("#chatInput");
      if (input) input.value = "";
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10_000);
      try {
        const response = await fetch("/api/teoyube/teo-guide", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ input: prompt, conversationId: conversationIdRef.current, locale: navigator.language || "en" }),
          signal: controller.signal
        });
        const body: unknown = await response.json();
        const client = isObject(body) ? body.client : undefined;
        if (!response.ok || !isClientResponse(client)) throw new Error("Controlled Teo Guide response unavailable.");
        if (generation !== requestGenerationRef.current) return;
        lastMessageRef.current = client.message;
        chatLog.insertAdjacentHTML("beforeend", renderGuideMessage(client.message, client));
        chatLog.scrollTop = chatLog.scrollHeight;
        setNotice({ title: "Teo Guide responded", detail: "Deterministic local Scripture guidance; no live AI or silent durable write was used.", scripture: client.sourceReferences[0] || client.message.sources[0]?.reference });
      } catch {
        if (generation !== requestGenerationRef.current) return;
        const fallback = createDeterministicTeoGuideMessage(prompt);
        lastMessageRef.current = fallback;
        chatLog.insertAdjacentHTML("beforeend", renderGuideMessage(fallback));
        chatLog.scrollTop = chatLog.scrollHeight;
        setNotice({ title: "Teo Guide safe fallback", detail: "The server-owned deterministic response was unavailable, so the existing local Scripture fallback was used. No live AI or durable write was used.", scripture: fallback.sources[0]?.reference });
      } finally {
        window.clearTimeout(timeout);
      }
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement;
      if (form.id !== "chatForm") return;
      event.preventDefault();
      void submitPrompt(root?.querySelector<HTMLInputElement>("#chatInput")?.value || "");
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const prompt = target.closest<HTMLElement>(".prompt-chip[data-prompt]");
      if (prompt) {
        const input = root.querySelector<HTMLInputElement>("#chatInput");
        if (input) input.value = prompt.dataset.prompt || "";
        void submitPrompt(prompt.dataset.prompt || "");
        return;
      }
      const action = target.closest<HTMLElement>("[data-phase116b-action]")?.dataset.phase116bAction;
      if (action === "teo-clear-chat") {
        requestGenerationRef.current += 1;
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
