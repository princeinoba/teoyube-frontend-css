const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const lifecycleRoot = path.join(projectRoot, "generated", "teoyubeworld-media", "manifests");

function runCommand(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    windowsHide: true,
    shell: false
  });
}

function resolveFromPath(command) {
  const result = runCommand("where.exe", [command]);
  if (result.status !== 0) return { path: null, result };
  const resolved = String(result.stdout || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item && fs.existsSync(item));
  return { path: resolved ? path.resolve(resolved) : null, result };
}

function resolveExplicitExecutable(command, environmentName) {
  const explicit = String(process.env[environmentName] || "").trim();
  if (explicit && fs.existsSync(explicit)) return { path: path.resolve(explicit), source: environmentName };
  const localAppData = String(process.env.LOCALAPPDATA || "").trim();
  const installed = localAppData
    ? path.join(localAppData, "Programs", "FFmpeg", "current", "bin", `${command}.exe`)
    : null;
  if (installed && fs.existsSync(installed)) return { path: path.resolve(installed), source: "local_app_data_install" };
  const fromPath = resolveFromPath(command);
  return { path: fromPath.path, source: fromPath.path ? "PATH" : null };
}

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function findProjectInstallerArtifacts() {
  const binaries = [];
  const installers = [];
  const stack = [projectRoot];

  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === ".git") continue;
      const fullPath = path.join(current, entry.name);
      const lowerName = entry.name.toLowerCase();
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (lowerName.startsWith("teoyube-ffmpeg-install-")) installers.push(fullPath);
        stack.push(fullPath);
      } else if (entry.isFile()) {
        if (lowerName === "ffmpeg.exe" || lowerName === "ffprobe.exe") binaries.push(fullPath);
        if (lowerName === "ffmpeg-release-essentials.zip" || lowerName === "ffmpeg-release-essentials.zip.sha256") installers.push(fullPath);
      }
    }
  }

  return { binaries, installers };
}

function run() {
  const ffmpegResolution = resolveExplicitExecutable("ffmpeg", "TEOYUBE_FFMPEG_PATH");
  const ffprobeResolution = resolveExplicitExecutable("ffprobe", "TEOYUBE_FFPROBE_PATH");
  const ffmpegVersion = ffmpegResolution.path
    ? runCommand(ffmpegResolution.path, ["-hide_banner", "-version"])
    : { status: null, stdout: "", stderr: "" };
  const ffprobeVersion = ffprobeResolution.path
    ? runCommand(ffprobeResolution.path, ["-hide_banner", "-version"])
    : { status: null, stdout: "", stderr: "" };
  const encoders = ffmpegResolution.path
    ? runCommand(ffmpegResolution.path, ["-hide_banner", "-encoders"])
    : { status: null, stdout: "", stderr: "" };
  const jsonProbe = ffprobeResolution.path
    ? runCommand(ffprobeResolution.path, ["-v", "quiet", "-print_format", "json", "-show_program_version"])
    : { status: null, stdout: "", stderr: "" };

  let jsonMetadataValid = false;
  try {
    const parsed = JSON.parse(jsonProbe.stdout || "{}");
    jsonMetadataValid = Boolean(parsed.program_version && parsed.program_version.version);
  } catch {
    jsonMetadataValid = false;
  }

  const projectArtifacts = findProjectInstallerArtifacts();
  const encoderText = String(encoders.stdout || "");
  const derivativeAuthorizationPath = path.join(lifecycleRoot, "teoyubeworld-derivative-execution-authorization.json");
  const publicationAuthorizationPath = path.join(lifecycleRoot, "teoyubeworld-publication-authorization.json");
  const publicationReceiptPath = path.join(lifecycleRoot, "teoyubeworld-publication-receipt.json");
  const derivativeAuthorization = fs.existsSync(derivativeAuthorizationPath)
    ? JSON.parse(fs.readFileSync(derivativeAuthorizationPath, "utf8"))
    : null;
  const publicationAuthorization = fs.existsSync(publicationAuthorizationPath)
    ? JSON.parse(fs.readFileSync(publicationAuthorizationPath, "utf8"))
    : null;
  const publicationReceipt = fs.existsSync(publicationReceiptPath)
    ? JSON.parse(fs.readFileSync(publicationReceiptPath, "utf8"))
    : null;
  const checks = [
    { id: "ffmpeg_resolves", passed: Boolean(ffmpegResolution.path), detail: ffmpegResolution.path || "ffmpeg is not on PATH." },
    { id: "ffprobe_resolves", passed: Boolean(ffprobeResolution.path), detail: ffprobeResolution.path || "ffprobe is not on PATH." },
    { id: "ffmpeg_version", passed: ffmpegVersion.status === 0, detail: String(ffmpegVersion.stdout || ffmpegVersion.stderr || "Version command did not run.").split(/\r?\n/)[0] },
    { id: "ffprobe_version", passed: ffprobeVersion.status === 0, detail: String(ffprobeVersion.stdout || ffprobeVersion.stderr || "Version command did not run.").split(/\r?\n/)[0] },
    { id: "installation_outside_project", passed: Boolean(ffmpegResolution.path && ffprobeResolution.path) && !isWithin(projectRoot, ffmpegResolution.path) && !isWithin(projectRoot, ffprobeResolution.path), detail: "Resolved executables must remain outside the Teoyube repository." },
    { id: "h264_libx264", passed: encoders.status === 0 && /\blibx264\b/.test(encoderText), detail: "H.264 encoding support through libx264 is required." },
    { id: "ffprobe_json", passed: jsonProbe.status === 0 && jsonMetadataValid, detail: "FFprobe must return structured JSON program metadata without reading project media." },
    { id: "no_project_binaries", passed: projectArtifacts.binaries.length === 0, detail: projectArtifacts.binaries.length ? projectArtifacts.binaries.map((item) => path.relative(projectRoot, item)).join(", ") : "No FFmpeg or FFprobe binary exists inside the project." },
    { id: "no_project_installer", passed: projectArtifacts.installers.length === 0, detail: projectArtifacts.installers.length ? projectArtifacts.installers.map((item) => path.relative(projectRoot, item)).join(", ") : "No FFmpeg installer artifact exists inside the project." },
    { id: "derivative_authorization_scope", passed: !derivativeAuthorization || (derivativeAuthorization.authorizationType === "approved_pilot_derivative_execution" && derivativeAuthorization.publicationAuthorized === false && derivativeAuthorization.publicWriteAuthorized === false), detail: derivativeAuthorization ? "Existing execution authorization is limited to approved pilot derivatives." : "Tool readiness does not create derivative execution authorization." },
    { id: "publication_lifecycle_scope", passed: !publicationAuthorization || (publicationAuthorization.authorizationType === "approved_pilot_publication" && publicationAuthorization.ownerConfirmation?.confirmed === true && (!publicationReceipt || publicationReceipt.lifecycleState === "published")), detail: publicationAuthorization ? "Existing publication authorization and receipt retain the approved pilot scope." : "Tool readiness does not create publication authorization." }
  ];

  const report = {
    ready: checks.every((item) => item.passed),
    checkedAt: new Date().toISOString(),
    platform: process.platform,
    architecture: process.arch,
    projectRoot,
    ffmpeg: {
      path: ffmpegResolution.path,
      resolutionSource: ffmpegResolution.source,
      version: String(ffmpegVersion.stdout || "").split(/\r?\n/)[0] || null,
      h264Libx264: /\blibx264\b/.test(encoderText),
      aac: /^\s*A\S*\s+aac\s/m.test(encoderText),
      vp8Vp9: /\blibvpx(?:-vp9)?\b/.test(encoderText),
      webp: /\blibwebp(?:_anim)?\b/.test(encoderText)
    },
    ffprobe: {
      path: ffprobeResolution.path,
      resolutionSource: ffprobeResolution.source,
      version: String(ffprobeVersion.stdout || "").split(/\r?\n/)[0] || null,
      jsonMetadataValid
    },
    installation: {
      outsideProject: Boolean(ffmpegResolution.path && ffprobeResolution.path) && !isWithin(projectRoot, ffmpegResolution.path) && !isWithin(projectRoot, ffprobeResolution.path),
      projectBinaryCount: projectArtifacts.binaries.length,
      projectInstallerArtifactCount: projectArtifacts.installers.length,
      tempDirectory: os.tmpdir()
    },
    authorization: {
      derivativeExecutionAuthorized: Boolean(derivativeAuthorization),
      publicationAuthorized: Boolean(publicationAuthorization),
      lifecycleStateChanged: false
    },
    safety: {
      mediaFilesRead: 0,
      mediaFilesCopied: 0,
      mediaFilesTranscoded: 0,
      publicFilesWritten: 0,
      pathModified: false
    },
    checks
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.ready) process.exitCode = 1;
  return report;
}

if (require.main === module) run();

module.exports = { run, resolveFromPath, resolveExplicitExecutable, findProjectInstallerArtifacts };
