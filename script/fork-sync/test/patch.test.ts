import { expect, test } from "bun:test"
import { config } from "../config"
import { PATCHES } from "../src/patches"

test("catalog patches are unique and well-formed", () => {
  expect(new Set(PATCHES.map((p) => p.id)).size).toBe(PATCHES.length)
  expect(config.patches.length).toBe(PATCHES.length)
  expect(config.packageName).toBe("zoo-code")
  expect(config.installKind).toBe("vsix")
  expect(config.genericPackage).toBe("zoocode-aie")
  expect(config.defaultAieRef).toBe("v3.72.0-3-aie")
  expect(config.targetBranch).toBe("aie")
  for (const p of PATCHES) {
    expect(p.id.length).toBeGreaterThan(0)
    expect(["add", "modify", "removal"]).toContain(p.strategy)
    expect(p.targets.length).toBeGreaterThan(0)
    expect(p.verify.length).toBeGreaterThan(0)
  }
})

test("gitlab-ci does not include the fork-sync GitLab job", () => {
  const ci = PATCHES.find((p) => p.id === "gitlab-ci")
  expect(ci?.targets).toEqual([".gitlab-ci.yml"])
  expect(ci?.targets).not.toContain(".gitlab/ci/fork-sync.gitlab-ci.yml")
  expect(ci?.verify.some((v) => v.pattern.includes("fork-sync"))).toBe(false)
})

test("try-out publish is the GitHub VSIX workflow", () => {
  const ci = PATCHES.find((p) => p.id === "github-vsix")
  expect(ci?.strategy).toBe("add")
  expect(ci?.targets).toContain(".github/workflows/aie-publish-test.yml")
  expect(ci?.verify.some((v) => v.pattern === "publish_test")).toBe(true)
  expect(ci?.verify.some((v) => v.pattern === "build_package")).toBe(true)
  expect(ci?.verify.some((v) => v.pattern === "zoocode-aie")).toBe(true)
  expect(ci?.intent).not.toMatch(/npm install/)
})

test("every catalog marker is owned by at least one patch", () => {
  for (const marker of config.markers) {
    const owned = PATCHES.some(
      (p) => p.targets.some((t) => t.includes(marker)) || p.verify.some((v) => v.pattern.includes(marker)),
    )
    expect(owned, `marker ${marker} has no owning patch`).toBe(true)
  }
})
