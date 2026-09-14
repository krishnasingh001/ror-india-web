#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outputDir = path.join(root, 'demo-output')
const destDir = path.join(root, 'demo-videos')
const prefix = process.argv[2] || 'demo'
fs.mkdirSync(destDir, { recursive: true })

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else if (entry.name.endsWith('.webm') || entry.name.endsWith('.mp4')) files.push(full)
  }
  return files
}

const videos = walk(outputDir)
if (videos.length === 0) {
  console.error('No demo videos found under demo-output/. Run a demo script first.')
  process.exit(1)
}

videos.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
const newest = videos[0]
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const dest = path.join(destDir, `${prefix}-${stamp}.webm`)
fs.copyFileSync(newest, dest)
console.log(`Saved: ${dest}`)
console.log(`Source: ${newest}`)

// Copy matching timeline (written by demo specs) next to the video
const kindByPrefix = {
  'client-investor-demo': 'client-investor',
  'recruiter-flow': 'recruiter',
}
const kind = kindByPrefix[prefix] || prefix
const timelineSrc = path.join(destDir, `.last-timeline-${kind}.json`)
if (fs.existsSync(timelineSrc)) {
  const timelineDest = path.join(destDir, `${prefix}-${stamp}.timeline.json`)
  fs.copyFileSync(timelineSrc, timelineDest)
  console.log(`Timeline: ${timelineDest}`)
} else {
  console.warn(`No timeline at ${timelineSrc} — synced voiceover needs a re-record.`)
}
