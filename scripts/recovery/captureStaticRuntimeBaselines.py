#!/usr/bin/env python3
"""Capture immutable static-runtime screenshots and DOM/class snapshots.

This script is for the initial clean recovery baseline. Future baseline updates require
explicit owner approval and must never be used merely to make a visual test pass.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
BASE_URL = "http://localhost:4173"
OUTPUT_ROOT = ROOT / "tests" / "visual" / "baselines" / "static-runtime"
VIEWS = [
    "today",
    "search",
    "canon",
    "table",
    "calling",
    "book",
    "lexicon",
    "testimony",
    "guide",
    "ui-elements",
    "teoyube-tables",
    "roadmap",
]
VIEWPORTS = {
    "desktop-wide": {"width": 1440, "height": 900},
    "desktop-standard": {"width": 1280, "height": 800},
    "tablet-landscape": {"width": 1024, "height": 768},
    "tablet-portrait": {"width": 768, "height": 1024},
    "mobile": {"width": 390, "height": 844},
    "mobile-small": {"width": 360, "height": 800},
}


def wait_for_server(timeout_seconds: float = 15.0) -> bool:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"{BASE_URL}/index.html", timeout=1.0) as response:
                body = response.read(4096)
                if response.status == 200 and b"TEOYUBE App" in body:
                    return True
        except Exception:
            time.sleep(0.25)
    return False


def start_server() -> subprocess.Popen[str] | None:
    if wait_for_server(0.5):
        return None

    process = subprocess.Popen(
        ["node", "--preserve-symlinks-main", "server.js"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        start_new_session=True,
    )
    if not wait_for_server():
        output = ""
        if process.stdout:
            try:
                output = process.stdout.read()
            except Exception:
                pass
        process.terminate()
        raise RuntimeError(f"Static Teoyube server failed to start.\n{output}")
    return process


def stop_server(process: subprocess.Popen[str] | None) -> None:
    if not process:
        return
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except Exception:
        process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except Exception:
            process.kill()


def capture() -> None:
    server = start_server()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                headless=True,
                executable_path="/usr/bin/chromium",
                args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
            )
            try:
                initial_viewport = next(iter(VIEWPORTS.values()))
                context = browser.new_context(
                    viewport=initial_viewport,
                    device_scale_factor=1,
                    reduced_motion="no-preference",
                    color_scheme="light",
                    locale="en-US",
                )
                page = context.new_page()
                page.goto(BASE_URL, wait_until="domcontentloaded", timeout=30_000)
                page.wait_for_timeout(2_500)

                for viewport_name, viewport in VIEWPORTS.items():
                    page.set_viewport_size(viewport)
                    page.wait_for_timeout(350)

                    for view in VIEWS:
                        page.evaluate(
                            """
                            (view) => {
                              if (typeof window.setView !== 'function') {
                                throw new Error('window.setView is unavailable');
                              }
                              window.setView(view, { updateHash: false });
                              window.scrollTo(0, 0);
                            }
                            """,
                            view,
                        )
                        page.wait_for_timeout(450)
                        page.evaluate(
                            """
                            () => {
                              document.documentElement.style.scrollBehavior = 'auto';
                              document.body.style.caretColor = 'transparent';
                              for (const animation of document.getAnimations()) {
                                try { animation.pause(); } catch (_) {}
                              }
                            }
                            """
                        )

                        view_dir = OUTPUT_ROOT / viewport_name
                        view_dir.mkdir(parents=True, exist_ok=True)
                        page.screenshot(
                            path=str(view_dir / f"{view}.png"),
                            full_page=False,
                        )

                        if viewport_name == "desktop-wide":
                            snapshot = page.evaluate(
                                r"""
                                (view) => {
                                  const root = document.getElementById(view);
                                  if (!root) throw new Error(`Missing view: ${view}`);
                                  const elements = [root, ...root.querySelectorAll('*')];
                                  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
                                  return {
                                    view,
                                    bodyView: document.body.dataset.view || '',
                                    root: {
                                      tag: root.tagName.toLowerCase(),
                                      id: root.id,
                                      classes: [...root.classList],
                                    },
                                    elements: elements.map((element, index) => ({
                                      index,
                                      tag: element.tagName.toLowerCase(),
                                      id: element.id || '',
                                      classes: [...element.classList],
                                      role: element.getAttribute('role') || '',
                                      ariaLabel: element.getAttribute('aria-label') || '',
                                      dataView: element.getAttribute('data-view') || '',
                                      dataAction: element.getAttribute('data-action') || '',
                                      text: normalize(element.childElementCount === 0 ? element.textContent : '').slice(0, 160),
                                      src: element.getAttribute('src') || '',
                                      href: element.getAttribute('href') || '',
                                    })),
                                  };
                                }
                                """,
                                view,
                            )
                            (view_dir / f"{view}.dom.json").write_text(
                                json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n",
                                encoding="utf-8",
                            )
                        print(f"captured {viewport_name}/{view}", flush=True)

                context.close()
            finally:
                browser.close()
    finally:
        stop_server(server)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--initial-owner-baseline",
        action="store_true",
        help="Required acknowledgement for the one-time clean recovery capture.",
    )
    args = parser.parse_args()
    if not args.initial_owner_baseline:
        print(
            "Refusing to capture or update visual baselines without --initial-owner-baseline. "
            "Future changes require explicit owner approval.",
            file=sys.stderr,
        )
        return 2
    capture()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
