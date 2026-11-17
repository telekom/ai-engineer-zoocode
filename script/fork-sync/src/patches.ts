// Product delta lives on the last shipped *-aie tag (v3.72.0-3-aie).
// main is a pristine upstream mirror — conformity fails there until aie is rebased.
// The GitLab fork-sync include is not part of this catalog. Try-out VSIX publish
// is .github/workflows/aie-publish-test.yml. That file is newer than the shipped
// tag, so CI checks it out from FORK_SYNC_TOOLING_REF.
export const PATCHES = [
  {
    id: "gitlab-ci",
    title: "GitLab CI for Zoo VSIX publish",
    strategy: "add",
    intent:
      "Keep the existing GitLab pipeline for the aie branch and client tags. Do not add a fork-sync include. Try-out VSIX publish is the GitHub Actions workflow, not this file.",
    targets: [".gitlab-ci.yml"],
    verify: [
      { pattern: "AIE_BRANCH", path: ".gitlab-ci.yml" },
      { pattern: "packages/generic/zoocode-aie", path: ".gitlab-ci.yml" },
      { pattern: "publish_stable", path: ".gitlab-ci.yml" },
    ],
  },
  {
    id: "github-vsix",
    title: "GitHub Actions VSIX publish",
    strategy: "add",
    intent:
      "Copy the AIE GitHub workflows. v*-test tags run build_package and publish_test and upload zoo-code-<version>.vsix to the GitHub Release for package zoocode-aie. Testers install with code --install-extension. This is not an npm package. Do not create a vX.Y.Z-aie tag from the try-out workflow.",
    targets: [
      ".github/workflows/aie-publish.yml",
      ".github/workflows/aie-publish-stable.yml",
      ".github/workflows/aie-publish-test.yml",
    ],
    verify: [
      { pattern: "AIE Publish VSIX", path: ".github/workflows/aie-publish.yml" },
      { pattern: "v*-aie", path: ".github/workflows/aie-publish-stable.yml" },
      { pattern: "build_package", path: ".github/workflows/aie-publish-test.yml" },
      { pattern: "publish_test", path: ".github/workflows/aie-publish-test.yml" },
      { pattern: "zoocode-aie", path: ".github/workflows/aie-publish-test.yml" },
    ],
  },
  {
    id: "branding-package-json",
    title: "Zoo Code for AI Engineer VS Code identity",
    strategy: "modify",
    intent: "Extension publisher is aiengineer and displayName is Zoo Code for AI Engineer.",
    targets: ["src/package.json", "src/package.nls.json"],
    verify: [
      { pattern: '"publisher": "aiengineer"', path: "src/package.json" },
      { pattern: '"extension.displayName": "Zoo Code for AI Engineer"', path: "src/package.nls.json" },
    ],
  },
  {
    id: "plugin-proxy-version-compare",
    title: "Numeric version compare for plugin self-update",
    strategy: "add",
    intent:
      "AIE-only helper: isNewerVersion() compares major.minor.patch-build strings for the plugin-proxy self-update check. This file does not exist upstream; copy it from last AIE.",
    targets: ["src/utils/methods.ts"],
    verify: [{ pattern: "isNewerVersion", path: "src/utils/methods.ts" }],
  },
  {
    id: "plugin-proxy-self-update",
    title: "Self-update via AIFS plugin proxy",
    strategy: "modify",
    intent:
      "In the current src/extension.ts activate(), check plugins.ai.t-systems.net/v1/registry/releases/zoo-code/latest for a newer zoo-code VSIX and offer download/install. Import isNewerVersion from ./utils/methods (already added; do not recreate that file). Use global fetch, not node-fetch. Do not rewrite telemetry, model-cache refresh, or deactivate().",
    targets: ["src/extension.ts"],
    verify: [
      {
        pattern: "plugins.ai.t-systems.net/v1/registry/releases/zoo-code/latest/info",
        path: "src/extension.ts",
      },
      { pattern: "isNewerVersion", path: "src/extension.ts" },
    ],
  },
  {
    id: "openai-model-catalog",
    title: "OpenAI model catalog host",
    strategy: "add",
    intent: "Default model catalog URL stays on plugins.ai.t-systems.net. This file does not exist upstream; copy it from last AIE.",
    targets: ["src/services/openai-model-catalog.ts"],
    verify: [
      {
        pattern: "plugins.ai.t-systems.net/external/.well-known/opencode",
        path: "src/services/openai-model-catalog.ts",
      },
    ],
  },
  {
    id: "telemetry-disabled",
    title: "Telemetry stays off",
    strategy: "modify",
    intent: "PostHog capture is a no-op and the cloud telemetry URL is emptied.",
    targets: ["packages/telemetry/src/PostHogTelemetryClient.ts", "packages/cloud/src/TelemetryClient.ts"],
    verify: [
      { pattern: "AIE: Disable Telemetry", path: "packages/telemetry/src/PostHogTelemetryClient.ts" },
      { pattern: "Overwrite url to empty string", path: "packages/cloud/src/TelemetryClient.ts" },
    ],
  },
  {
    id: "external-auth-disabled",
    title: "Disable Zoo Cloud and Codex OAuth",
    strategy: "modify",
    intent:
      "Short-circuit Zoo Cloud auth and Codex OAuth HTTP calls. In src/services/zoo-code-auth.ts, comment-wrap the fetch bodies in handleAuthCallback (then return false), verifyZooCodeToken (then return \"invalid\"), and disconnectZooCode (skip revoke). Insert the exact comment `[AIE] External network call disabled for compliance: always fail authentication.` in handleAuthCallback. In src/integrations/openai-codex/oauth.ts, comment-wrap the token HTTP in exchangeCodeForTokens and refreshAccessToken, then throw `[AIE] OpenAI Codex OAuth is disabled for compliance.` Keep the surrounding functions; do not delete the rest of either file. After the acceptance greps pass, stop — do not re-read with line offsets from before the edit.",
    targets: ["src/services/zoo-code-auth.ts", "src/integrations/openai-codex/oauth.ts"],
    verify: [
      {
        pattern: "[AIE] External network call disabled for compliance: always fail authentication.",
        path: "src/services/zoo-code-auth.ts",
      },
      { pattern: "[AIE] OpenAI Codex OAuth is disabled for compliance.", path: "src/integrations/openai-codex/oauth.ts" },
    ],
  },
  {
    id: "openai-compatible-model-list",
    title: "AIE chat proxy model list",
    strategy: "modify",
    intent: "OpenAI-compatible model fetch accepts both .id (AIFS) and .name (chat proxy).",
    targets: ["src/api/providers/openai.ts"],
    verify: [{ pattern: "AIE chat proxy returned models", path: "src/api/providers/openai.ts" }],
  },
  {
    id: "openrouter-popup-guard",
    title: "Rebuild API handler to avoid OpenRouter popups",
    strategy: "modify",
    intent: "Force-rebuild the API handler after provider profile changes so OpenRouter popups do not appear.",
    targets: ["src/core/webview/ClineProvider.ts"],
    verify: [
      { pattern: "FOR AIE: Force rebuilding of API Handler", path: "src/core/webview/ClineProvider.ts" },
      { pattern: "Ensure provider profile is activated after reload", path: "src/core/webview/ClineProvider.ts" },
    ],
  },
  {
    id: "autoapprove-disabled",
    title: "No auto-approve for execute or outside-workspace write",
    strategy: "modify",
    intent: "Command execution auto-approval is removed; the settings UI hides the execute toggle.",
    targets: ["src/core/auto-approval/index.ts", "webview-ui/src/components/settings/AutoApproveSettings.tsx"],
    verify: [
      { pattern: "Command execution auto-approval removed", path: "src/core/auto-approval/index.ts" },
      {
        pattern: "FOR AIE: Disable auto approval of terminal command execution",
        path: "webview-ui/src/components/settings/AutoApproveSettings.tsx",
      },
    ],
  },
  {
    id: "default-openai-provider",
    title: "Default first-run provider is OpenAI-compatible",
    strategy: "modify",
    intent: "Welcome setup defaults apiProvider to openai, not openrouter.",
    targets: ["webview-ui/src/components/welcome/WelcomeViewProvider.tsx"],
    verify: [{ pattern: 'apiProvider: "openai"', path: "webview-ui/src/components/welcome/WelcomeViewProvider.tsx" }],
  },
  {
    id: "vendor-ripgrep",
    title: "Vendored ripgrep for locked-down CI",
    strategy: "add",
    intent:
      "pnpm install must not download @vscode/ripgrep from GitHub. Copy the whole vendor/ripgrep tree (binaries included), not only README.md. Use in-repo vendor/ripgrep binaries.",
    targets: ["scripts/vendor-ripgrep.mjs", "vendor/ripgrep"],
    verify: [
      { pattern: "vendor/ripgrep", path: "scripts/vendor-ripgrep.mjs" },
      { pattern: "@vscode/ripgrep", path: "scripts/vendor-ripgrep.mjs" },
    ],
  },
]
