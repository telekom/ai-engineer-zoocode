import { PATCHES } from "./src/patches"

export const config = {
  packageName: "zoo-code",
  npmScope: "@aie",
  installKind: "vsix" as const,
  genericPackage: "zoocode-aie",
  defaultAieRef: "v3.72.0-3-aie",
  packageDir: "src",
  targetBranch: "aie",
  markers: [
    "AIE_BRANCH",
    "zoocode-aie",
    "aiengineer",
    "plugins.ai.t-systems.net",
    "AIE: Disable Telemetry",
    "[AIE] External network call disabled",
  ],
  securityAllowlistHosts: [
    "plugins.ai.t-systems.net",
    "plugins.dev.aie.ai.t-systems.net",
    "llm-server.llmhub.t-systems.net",
    "llmops.telekom.de",
  ],
  patches: PATCHES,
}
