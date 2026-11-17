import { resolve } from "path"

/** Run a CLI from the sibling aie-fork-sync engine. */
export async function delegate(script: string) {
  const root = process.env.FORK_SYNC_ENGINE_DIR?.trim() || resolve(import.meta.dir, "../../../aie-fork-sync")
  const engine = resolve(root, script)
  if (!(await Bun.file(engine).exists())) {
    console.error(`aie-fork-sync is not at ${root}`)
    console.error("Clone it next to this repo, or set FORK_SYNC_ENGINE_DIR.")
    process.exit(1)
  }
  if (!process.env.FORK_SYNC_CONFIG?.trim()) {
    process.env.FORK_SYNC_CONFIG = resolve(import.meta.dir, "config.ts")
  }
  const proc = Bun.spawn(["bun", "run", engine], {
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
    env: process.env,
  })
  process.exit(await proc.exited)
}
