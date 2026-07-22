"use client";

import { useEffect, useRef, useState } from "react";
import type { TeoGuideClientResponseDto } from "../../domain/teo-guide/teo-guide-client-dto";
import { createDeterministicTeoGuideMessage, type TeoGuideMessage } from "../../domain/teo-guide/teo-guide-message";
import type { TeoGuidePageViewModel } from "../../features/teo-guide/application/teo-guide-page-service";
import { ApprovedMigrationOverlays, type ExternalServiceStatus, type MigrationNotice } from "../_approved-source/ApprovedMigrationOverlays";
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
    && isObject(value.modelUse)
    && typeof value.safety.mode === "string"
    && value.safety.postValidationPassed === true
    && typeof value.deterministic === "boolean"
    && typeof value.externalModelUsed === "boolean"
    && ((value.modelUse.mode === "live" && value.externalModelUsed === true && value.deterministic === false)
      || (value.modelUse.mode === "deterministic" && value.externalModelUsed === false && value.deterministic === true))
    && value.durableWritePerformed === false;
}

type LiveStatus = Readonly<{
  liveAiConfigured: boolean;
  externalProcessingConsent: boolean;
  memoryContextConsent: boolean;
}>;

export function TeoGuidePageController({ initialViewModel }: { initialViewModel: TeoGuidePageViewModel }) {
  const rootRef = useRef<HTMLElement>(null);
  const originalChatRef = useRef("");
  const lastMessageRef = useRef(initialViewModel.initialMessage);
  const conversationIdRef = useRef("");
  const requestGenerationRef = useRef(0);
  const activeControllerRef = useRef<AbortController | null>(null);
  const forceDeterministicRef = useRef(false);
  const externalServiceStatusRef = useRef<ExternalServiceStatus>(null);
  const [notice, setNotice] = useState<MigrationNotice>(null);
  const [externalServiceStatus, setExternalServiceStatus] = useState<ExternalServiceStatus>(null);

  useEffect(() => {
    externalServiceStatusRef.current = externalServiceStatus;
  }, [externalServiceStatus]);

  useEffect(() => {
    const statusController = new AbortController();
    void fetch("/api/teoyube/teo-guide", { cache: "no-store", signal: statusController.signal }).then(async (response) => {
      if (!response.ok) return;
      const status = await response.json() as LiveStatus;
      if (!status.liveAiConfigured) return;
      if (status.externalProcessingConsent) {
        externalServiceStatusRef.current = "live_ready";
        setExternalServiceStatus("live_ready");
        setNotice({ title: "Guarded live AI ready", detail: `Your next message may be processed by the approved external model. Authorized memory context is ${status.memoryContextConsent ? "available" : "off"}; deterministic Teo Guide remains available.`, actionLabel: "Use deterministic next" });
      } else {
        externalServiceStatusRef.current = "live_consent_required";
        setExternalServiceStatus("live_consent_required");
        setNotice({ title: "External AI is off", detail: "No message will be sent to an external model without separate external-processing consent. Deterministic Teo Guide remains fully available." });
      }
    }).catch(() => undefined);
    return () => statusController.abort();
  }, []);

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
      activeControllerRef.current?.abort();
      const controller = new AbortController();
      activeControllerRef.current = controller;
      const liveRequested = externalServiceStatusRef.current === "live_ready" && !forceDeterministicRef.current;
      if (liveRequested) setNotice({ title: "Preparing guarded response", detail: "Checking safety, finding Scripture, reviewing sources, and validating guidance before any model language is displayed." });
      const timeout = window.setTimeout(() => controller.abort(), liveRequested ? 25_000 : 10_000);
      try {
        const response = await fetch(liveRequested ? "/api/teoyube/teo-guide/stream" : "/api/teoyube/teo-guide", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ input: prompt, conversationId: conversationIdRef.current, locale: navigator.language || "en", mode: forceDeterministicRef.current ? "deterministic" : "live_if_authorized" }),
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Controlled Teo Guide response unavailable.");
        let client: unknown;
        if (liveRequested) {
          if (!response.body) throw new Error("Validated response stream unavailable.");
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffered = "";
          let approvedSections = 0;
          while (true) {
            const chunk = await reader.read();
            buffered += decoder.decode(chunk.value || new Uint8Array(), { stream: !chunk.done });
            const lines = buffered.split("\n");
            buffered = lines.pop() || "";
            for (const rawLine of lines) {
              if (!rawLine.trim()) continue;
              const event: unknown = JSON.parse(rawLine);
              if (!isObject(event) || typeof event.type !== "string") continue;
              if (event.type === "progress" && event.stage === "source_validation") setNotice({ title: "Sources prepared", detail: "Exact Scripture, TIG provenance, consent boundaries, and authorized context are being checked." });
              if (event.type === "progress" && event.stage === "response_validation") setNotice({ title: "Validating response", detail: "The complete structured response is being checked for citations, theology, safety, and approved actions before display." });
              if (event.type === "approved_section") {
                approvedSections += 1;
                setNotice({ title: "Validated sections ready", detail: `${approvedSections} source-bound section${approvedSections === 1 ? " is" : "s are"} approved; raw provider text is never displayed.` });
              }
              if (event.type === "complete") client = event.client;
            }
            if (chunk.done) break;
          }
        } else {
          const body: unknown = await response.json();
          client = isObject(body) ? body.client : undefined;
        }
        if (!isClientResponse(client)) throw new Error("Controlled Teo Guide response unavailable.");
        if (generation !== requestGenerationRef.current) return;
        lastMessageRef.current = client.message;
        chatLog.insertAdjacentHTML("beforeend", renderGuideMessage(client.message, client));
        chatLog.scrollTop = chatLog.scrollHeight;
        setNotice(client.externalModelUsed ? {
          title: "Teo Guide responded",
          detail: `Guarded external language synthesis was validated before display. Authorized memory was ${client.modelUse.memoryIncluded ? "included" : "not included"}; no silent durable write occurred.`,
          scripture: client.sourceReferences[0] || client.message.sources[0]?.reference,
          actionLabel: "Use deterministic next"
        } : {
          title: client.modelUse.fallbackReason ? "Teo Guide deterministic fallback" : "Teo Guide responded",
          detail: client.modelUse.fallbackReason ? `External AI was not used (${client.modelUse.fallbackReason}). Deterministic Scripture guidance remained available and no durable write occurred.` : "Deterministic local Scripture guidance; no live AI or silent durable write was used.",
          scripture: client.sourceReferences[0] || client.message.sources[0]?.reference,
          ...(externalServiceStatusRef.current === "live_ready" ? { actionLabel: "Use live when authorized" } : {})
        });
      } catch {
        if (generation !== requestGenerationRef.current) return;
        const fallback = createDeterministicTeoGuideMessage(prompt);
        lastMessageRef.current = fallback;
        chatLog.insertAdjacentHTML("beforeend", renderGuideMessage(fallback));
        chatLog.scrollTop = chatLog.scrollHeight;
        setNotice({ title: "Teo Guide safe fallback", detail: "The server-owned deterministic response was unavailable, so the existing local Scripture fallback was used. No live AI or durable write was used.", scripture: fallback.sources[0]?.reference });
      } finally {
        window.clearTimeout(timeout);
        if (activeControllerRef.current === controller) activeControllerRef.current = null;
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
        activeControllerRef.current?.abort();
        activeControllerRef.current = null;
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
    return () => { activeControllerRef.current?.abort(); root.removeEventListener("submit", onSubmit); root.removeEventListener("click", onClick); };
  }, [initialViewModel]);

  function toggleGenerationMode() {
    forceDeterministicRef.current = !forceDeterministicRef.current;
    externalServiceStatusRef.current = forceDeterministicRef.current ? "deterministic_selected" : "live_ready";
    setExternalServiceStatus(externalServiceStatusRef.current);
    setNotice(forceDeterministicRef.current
      ? { title: "Deterministic mode selected", detail: "Your next message will remain local to deterministic Teo Guide. No external model will process it.", actionLabel: "Use live when authorized" }
      : { title: "Guarded live AI ready", detail: "Your next message may be processed by the approved external model after consent and safety checks. Deterministic mode remains available.", actionLabel: "Use deterministic next" });
  }

  return <><ApprovedTeoGuideView html={initialViewModel.approvedHtml} rootRef={rootRef} /><ApprovedMigrationOverlays notice={notice} clearNotice={() => setNotice(null)} noticeAction={toggleGenerationMode} externalServiceStatus={externalServiceStatus} /></>;
}
