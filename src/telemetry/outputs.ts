import { promises as fs } from 'node:fs'
import path from 'node:path'

export interface ArtifactOutput {
  name: string
  size: number
  status: 'done' | 'pending' | 'skipped'
}

/**
 * Collect artifact output files from a directory.
 * Scans files in the given directory and returns name, size, and status.
 * Directories and hidden files are skipped.
 */
export async function collectArtifactOutputs(dir: string): Promise<ArtifactOutput[]> {
  try {
    await fs.access(dir)
  } catch {
    return []
  }

  const outputs: ArtifactOutput[] = []
  let entries: string[] = []

  try {
    entries = await fs.readdir(dir)
  } catch {
    return outputs
  }

  for (const entry of entries) {
    if (entry.startsWith('.')) continue
    const fullPath = path.join(dir, entry)
    try {
      const stat = await fs.stat(fullPath)
      if (!stat.isFile()) continue
      outputs.push({
        name: entry,
        size: stat.size,
        status: 'done',
      })
    } catch {
      outputs.push({
        name: entry,
        size: 0,
        status: 'pending',
      })
    }
  }

  return outputs
}
