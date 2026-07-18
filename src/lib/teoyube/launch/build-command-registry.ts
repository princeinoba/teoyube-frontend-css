import type { TeoyubeBuildCommand } from "./build-verification-contracts";

export type TeoyubePackageJsonLike = {
  scripts?: Record<string, string>;
};

function command(
  id: TeoyubeBuildCommand["id"],
  scriptName: string,
  scripts: Record<string, string>,
  required: boolean,
  description: string
): TeoyubeBuildCommand {
  return {
    id,
    scriptName,
    command: scripts[scriptName],
    required,
    available: Boolean(scripts[scriptName]),
    description,
    riskLevel: required ? "high" : "medium"
  };
}

export function getTeoyubeBuildCommandRegistry(packageJsonLike: TeoyubePackageJsonLike = {}): TeoyubeBuildCommand[] {
  const scripts = packageJsonLike.scripts || {};
  const smokeNames = Object.keys(scripts).filter((name) => name.includes("smoke"));

  return [
    command("typecheck", "typecheck", scripts, false, "TypeScript verification when a script exists."),
    command("lint", "lint", scripts, false, "Lint verification when a script exists."),
    command("build", "build", scripts, true, "Production build verification."),
    command("test", "test", scripts, false, "Automated tests when a script exists."),
    ...smokeNames.map((scriptName) => command("smoke", scriptName, scripts, false, "Existing smoke check script.")),
    command("preview", "preview", scripts, false, "Preview command if the app defines one."),
    command("start", "start", scripts, false, "Start command for post-build local verification.")
  ];
}

export function getRequiredBuildVerificationCommands(packageJsonLike: TeoyubePackageJsonLike = {}): TeoyubeBuildCommand[] {
  return getTeoyubeBuildCommandRegistry(packageJsonLike).filter((entry) => entry.required);
}

export function getOptionalBuildVerificationCommands(packageJsonLike: TeoyubePackageJsonLike = {}): TeoyubeBuildCommand[] {
  return getTeoyubeBuildCommandRegistry(packageJsonLike).filter((entry) => !entry.required);
}

export function getAvailableBuildCommandsFromPackageScripts(packageJsonLike: TeoyubePackageJsonLike = {}): TeoyubeBuildCommand[] {
  return getTeoyubeBuildCommandRegistry(packageJsonLike).filter((entry) => entry.available);
}

export function createBuildCommandVerificationPlan(packageJsonLike: TeoyubePackageJsonLike = {}) {
  const commands = getTeoyubeBuildCommandRegistry(packageJsonLike);

  return {
    commands,
    requiredCommands: commands.filter((entry) => entry.required),
    optionalCommands: commands.filter((entry) => !entry.required),
    missingRequiredCommands: commands.filter((entry) => entry.required && !entry.available),
    missingOptionalCommands: commands.filter((entry) => !entry.required && !entry.available),
    generatedAt: new Date().toISOString()
  };
}

export function createBuildCommandRegistryReport(packageJsonLike: TeoyubePackageJsonLike = {}) {
  const plan = createBuildCommandVerificationPlan(packageJsonLike);

  return {
    valid: plan.missingRequiredCommands.length === 0,
    commandCount: plan.commands.length,
    availableCommands: plan.commands.filter((entry) => entry.available),
    missingRequiredCommands: plan.missingRequiredCommands,
    missingOptionalCommands: plan.missingOptionalCommands,
    plan,
    generatedAt: new Date().toISOString()
  };
}

