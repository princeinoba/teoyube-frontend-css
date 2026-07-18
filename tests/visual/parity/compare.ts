import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  assertDisposableCandidatePath,
  crossPlatformStaticTolerance,
  geometryTolerancePx,
  screenshotTolerance,
  type ViewId
} from "./config";
import type { LegacyDomSnapshot, RichParityContract } from "./capture";

export interface ScreenshotComparison {
  differentPixels: number;
  differentPixelRatio: number;
  maxChannelDelta: number;
  meanPerceptualDelta: number;
  maxRegionalPerceptualDelta: number;
  strictPassed: boolean;
  passed: boolean;
}

function elementSignature(element: LegacyDomSnapshot["elements"][number]) {
  return {
    tag: element.tag || "",
    id: element.id || "",
    classes: [...(element.classes || [])],
    role: element.role || "",
    ariaLabel: element.ariaLabel || "",
    dataView: element.dataView || "",
    dataAction: element.dataAction || "",
    src: element.src || "",
    href: element.href || ""
  };
}

export function compareLegacyDom(baselinePath: string, candidatePath: string, view: ViewId): string[] {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8")) as LegacyDomSnapshot;
  const candidate = JSON.parse(fs.readFileSync(candidatePath, "utf8")) as LegacyDomSnapshot;
  const failures: string[] = [];

  if (baseline.bodyView !== candidate.bodyView) {
    failures.push(`body data-view differs: baseline=${baseline.bodyView} candidate=${candidate.bodyView}`);
  }
  if (JSON.stringify(baseline.root) !== JSON.stringify(candidate.root)) {
    failures.push(`root differs: baseline=${JSON.stringify(baseline.root)} candidate=${JSON.stringify(candidate.root)}`);
  }
  if (baseline.elements.length !== candidate.elements.length) {
    failures.push(`element count differs: baseline=${baseline.elements.length} candidate=${candidate.elements.length}`);
  }

  const max = Math.max(baseline.elements.length, candidate.elements.length);
  for (let index = 0; index < max && failures.length < 30; index += 1) {
    const left = baseline.elements[index];
    const right = candidate.elements[index];
    if (!left || !right) continue;
    const leftSignature = elementSignature(left);
    const rightSignature = elementSignature(right);
    if (JSON.stringify(leftSignature) !== JSON.stringify(rightSignature)) {
      failures.push(
        `${view} DOM mismatch at ${index}: baseline=${JSON.stringify(leftSignature)} candidate=${JSON.stringify(rightSignature)}`
      );
    }
  }
  return failures;
}

export async function compareScreenshots(
  baselinePath: string,
  candidatePath: string,
  artifactDirectory: string,
  artifactName: string,
  alwaysWriteEvidence = false,
  allowCrossPlatformStaticTolerance = false
): Promise<ScreenshotComparison> {
  const baseline = await sharp(baselinePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const candidate = await sharp(candidatePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (baseline.info.width !== candidate.info.width || baseline.info.height !== candidate.info.height) {
    throw new Error(
      `Screenshot dimensions differ: baseline=${baseline.info.width}x${baseline.info.height} ` +
        `candidate=${candidate.info.width}x${candidate.info.height}`
    );
  }

  const pixelCount = baseline.info.width * baseline.info.height;
  const diff = Buffer.alloc(baseline.data.length);
  let differentPixels = 0;
  let maxChannelDelta = 0;
  for (let offset = 0; offset < baseline.data.length; offset += 4) {
    const red = Math.abs(baseline.data[offset] - candidate.data[offset]);
    const green = Math.abs(baseline.data[offset + 1] - candidate.data[offset + 1]);
    const blue = Math.abs(baseline.data[offset + 2] - candidate.data[offset + 2]);
    const alpha = Math.abs(baseline.data[offset + 3] - candidate.data[offset + 3]);
    const delta = Math.max(red, green, blue, alpha);
    maxChannelDelta = Math.max(maxChannelDelta, delta);
    if (delta > screenshotTolerance.channelDelta) differentPixels += 1;
    diff[offset] = delta;
    diff[offset + 1] = delta > screenshotTolerance.channelDelta ? 0 : delta;
    diff[offset + 2] = 0;
    diff[offset + 3] = 255;
  }
  const differentPixelRatio = differentPixels / pixelCount;
  const strictPassed = differentPixelRatio <= screenshotTolerance.maxDifferentPixelRatio;
  const perceptualWidth = 96;
  const perceptualHeight = 64;
  const baselinePerceptual = await sharp(baselinePath)
    .resize(perceptualWidth, perceptualHeight, { fit: "fill" })
    .blur(1)
    .removeAlpha()
    .raw()
    .toBuffer();
  const candidatePerceptual = await sharp(candidatePath)
    .resize(perceptualWidth, perceptualHeight, { fit: "fill" })
    .blur(1)
    .removeAlpha()
    .raw()
    .toBuffer();
  let perceptualDeltaTotal = 0;
  const regionalDeltas: number[] = [];
  for (let regionY = 0; regionY < 4; regionY += 1) {
    for (let regionX = 0; regionX < 4; regionX += 1) {
      let regionDelta = 0;
      let regionChannels = 0;
      for (let y = regionY * 16; y < (regionY + 1) * 16; y += 1) {
        for (let x = regionX * 24; x < (regionX + 1) * 24; x += 1) {
          for (let channel = 0; channel < 3; channel += 1) {
            const index = (y * perceptualWidth + x) * 3 + channel;
            const delta = Math.abs(baselinePerceptual[index] - candidatePerceptual[index]) / 255;
            regionDelta += delta;
            perceptualDeltaTotal += delta;
            regionChannels += 1;
          }
        }
      }
      regionalDeltas.push(regionDelta / regionChannels);
    }
  }
  const meanPerceptualDelta = perceptualDeltaTotal / baselinePerceptual.length;
  const maxRegionalPerceptualDelta = Math.max(...regionalDeltas);
  const crossPlatformPassed =
    allowCrossPlatformStaticTolerance &&
    meanPerceptualDelta <= crossPlatformStaticTolerance.meanPerceptualDelta &&
    maxRegionalPerceptualDelta <= crossPlatformStaticTolerance.maxRegionalPerceptualDelta;
  const passed = strictPassed || crossPlatformPassed;

  if (!passed || alwaysWriteEvidence) {
    assertDisposableCandidatePath(artifactDirectory);
    fs.mkdirSync(artifactDirectory, { recursive: true });
    await sharp(diff, {
      raw: { width: baseline.info.width, height: baseline.info.height, channels: 4 }
    }).png().toFile(path.join(artifactDirectory, `${artifactName}.diff.png`));
    await sharp({
      create: {
        width: baseline.info.width * 2,
        height: baseline.info.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([
        { input: baselinePath, left: 0, top: 0 },
        { input: candidatePath, left: baseline.info.width, top: 0 }
      ])
      .png()
      .toFile(path.join(artifactDirectory, `${artifactName}.side-by-side.png`));
    await sharp(baselinePath)
      .composite([{ input: candidatePath, blend: "difference" }])
      .png()
      .toFile(path.join(artifactDirectory, `${artifactName}.overlay-difference.png`));
  }

  return {
    differentPixels,
    differentPixelRatio,
    maxChannelDelta,
    meanPerceptualDelta,
    maxRegionalPerceptualDelta,
    strictPassed,
    passed
  };
}

function geometryFailures(label: string, leftRows: unknown[], rightRows: unknown[]): string[] {
  const failures: string[] = [];
  if (leftRows.length !== rightRows.length) {
    failures.push(`${label} count differs: static=${leftRows.length} next=${rightRows.length}`);
  }
  const count = Math.min(leftRows.length, rightRows.length);
  for (let index = 0; index < count && failures.length < 30; index += 1) {
    const left = leftRows[index] as Record<string, unknown>;
    const right = rightRows[index] as Record<string, unknown>;
    const leftGeometry = left.geometry as Record<string, number> | undefined;
    const rightGeometry = right.geometry as Record<string, number> | undefined;
    const leftWithoutGeometry = { ...left, geometry: undefined };
    const rightWithoutGeometry = { ...right, geometry: undefined };
    if (JSON.stringify(leftWithoutGeometry) !== JSON.stringify(rightWithoutGeometry)) {
      failures.push(`${label}[${index}] structure differs.`);
      continue;
    }
    if (leftGeometry && rightGeometry) {
      for (const key of ["x", "y", "width", "height"]) {
        if (Math.abs(leftGeometry[key] - rightGeometry[key]) > geometryTolerancePx) {
          failures.push(
            `${label}[${index}].${key} differs: static=${leftGeometry[key]} next=${rightGeometry[key]}`
          );
        }
      }
    }
  }
  return failures;
}

export function compareRichContracts(staticContract: RichParityContract, nextContract: RichParityContract): string[] {
  const failures: string[] = [];
  for (const key of ["orderedDom", "ids", "classLists", "assets", "visibleLabels", "focusOrder"] as const) {
    if (JSON.stringify(staticContract[key]) !== JSON.stringify(nextContract[key])) {
      failures.push(`${key} differs between static and Next candidates.`);
    }
  }
  failures.push(...geometryFailures("majorRegions", staticContract.majorRegions, nextContract.majorRegions));
  failures.push(
    ...geometryFailures("interactiveControls", staticContract.interactiveControls, nextContract.interactiveControls)
  );
  failures.push(
    ...geometryFailures("responsiveNavigation", staticContract.responsiveNavigation, nextContract.responsiveNavigation)
  );
  return failures.slice(0, 50);
}
