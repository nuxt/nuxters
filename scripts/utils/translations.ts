import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'

/**
 * Review actions on the translation records written by diglot, at `<locale>/segments/<hh>/<hash>.json`.
 * Each record keeps who last edited it (`by`, while `review` is `edited`), and who verified or rejected it.
 */
export type TranslationAction = 'edited' | 'verified' | 'rejected'

export type TranslationEvent = {
  action: TranslationAction
  /** GitHub login stored in the record. */
  login: string
  locale: string
  hash: string
  /** Commit date of the commit that brought the action to the branch. */
  date: string
}

export type TranslationCounts = Record<TranslationAction, number>

type RecordStamp = { by?: unknown, at?: unknown }

type SegmentRecord = {
  hash?: unknown
  review?: unknown
  by?: unknown
  verifiedBy?: RecordStamp
  rejectedBy?: RecordStamp
  updatedAt?: unknown
}

const RECORD_PATHSPEC = ':(glob)*/segments/**/*.json'
const NULL_OID = /^0+$/
const MAX_BUFFER = 512 * 1024 * 1024

const execFileAsync = promisify(execFile)

const git = async (gitDir: string, args: string[]) => {
  const { stdout } = await execFileAsync('git', ['--git-dir', gitDir, ...args], { maxBuffer: MAX_BUFFER })
  return stdout
}

/** Clone the default branch only, without a working tree. */
export const cloneRepository = async (url: string, dir: string) => {
  await execFileAsync('git', ['clone', '--quiet', '--bare', '--single-branch', url, dir], { maxBuffer: MAX_BUFFER })
}

const readBlobs = (gitDir: string, oids: string[]) => new Promise<Map<string, string>>((resolve, reject) => {
  const child = spawn('git', ['--git-dir', gitDir, 'cat-file', '--batch'], { stdio: ['pipe', 'pipe', 'inherit'] })
  const chunks: Buffer[] = []
  child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
  child.on('error', reject)
  child.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(`git cat-file exited with code ${code}`))
      return
    }
    const output = Buffer.concat(chunks)
    const blobs = new Map<string, string>()
    let offset = 0
    while (offset < output.length) {
      const headerEnd = output.indexOf(0x0A, offset)
      const [oid, type, size] = output.subarray(offset, headerEnd).toString('utf8').split(' ')
      if (type === 'missing' || !oid || !size) {
        offset = headerEnd + 1
        continue
      }
      const start = headerEnd + 1
      const end = start + Number(size)
      blobs.set(oid, output.subarray(start, end).toString('utf8'))
      offset = end + 1
    }
    resolve(blobs)
  })
  child.stdin.end(oids.map(oid => `${oid}\n`).join(''))
})

const parseRecord = (content: string | undefined): SegmentRecord | null => {
  if (!content) {
    return null
  }
  try {
    const record = JSON.parse(content) as unknown
    return record && typeof record === 'object' && !Array.isArray(record) ? record as SegmentRecord : null
  }
  catch {
    return null
  }
}

const stampOf = (stamp: RecordStamp | undefined) =>
  stamp && typeof stamp.by === 'string' && stamp.by ? { login: stamp.by, at: String(stamp.at ?? '') } : null

const recordActions = (record: SegmentRecord) => {
  const actions: { action: TranslationAction, login: string, at: string }[] = []
  if (record.review === 'edited' && typeof record.by === 'string' && record.by) {
    actions.push({ action: 'edited', login: record.by, at: String(record.updatedAt ?? '') })
  }
  const verified = stampOf(record.verifiedBy)
  if (verified) {
    actions.push({ action: 'verified', ...verified })
  }
  const rejected = stampOf(record.rejectedBy)
  if (rejected) {
    actions.push({ action: 'rejected', ...rejected })
  }
  return actions
}

type RecordChange = { date: string, path: string, oid: string }

/** Records added or changed by each commit on the first-parent history of `rev`, oldest first. A merge brings the changes of its branch. */
const listRecordChanges = async (gitDir: string, rev: string) => {
  const log = await git(gitDir, ['log', '--reverse', '--first-parent', '--diff-merges=first-parent', '--no-renames', '--raw', '--no-abbrev', '--format=%x00%cI', rev, '--', RECORD_PATHSPEC])
  const changes: RecordChange[] = []
  let date = ''
  for (const line of log.split('\n')) {
    if (line.startsWith('\0')) {
      date = new Date(line.slice(1)).toISOString()
      continue
    }
    if (!line.startsWith(':')) {
      continue
    }
    const [meta, path] = line.split('\t')
    const oid = meta?.split(' ')[3]
    if (path && oid && !NULL_OID.test(oid)) {
      changes.push({ date, path, oid })
    }
  }
  return changes
}

/**
 * Every review action that reached `rev`, dated by the first commit that holds it. A later commit that keeps it,
 * moves the record or reverts to it does not repeat it.
 */
export const readTranslationEvents = async (gitDir: string, rev = 'HEAD') => {
  const changes = await listRecordChanges(gitDir, rev)
  const blobs = await readBlobs(gitDir, [...new Set(changes.map(change => change.oid))])
  const seen = new Set<string>()
  const events: TranslationEvent[] = []
  for (const change of changes) {
    const record = parseRecord(blobs.get(change.oid))
    if (!record) {
      continue
    }
    const locale = change.path.split('/')[0]!
    const hash = typeof record.hash === 'string' ? record.hash : change.path.split('/').at(-1)!.replace(/\.json$/, '')
    for (const { action, login, at } of recordActions(record)) {
      const key = `${locale}/${hash}:${action}:${login.toLowerCase()}:${at}`
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      events.push({ action, login, locale, hash, date: change.date })
    }
  }
  return events
}

/**
 * Segments per period and lowercased login. A person counts a segment once per action in a period,
 * however many times they edited, verified or rejected it there.
 */
export const countTranslations = <Period extends string>(events: TranslationEvent[], periodsFor: (date: string) => Period[]) => {
  const counts = new Map<Period, Map<string, TranslationCounts>>()
  const counted = new Set<string>()
  for (const event of events) {
    const login = event.login.toLowerCase()
    for (const period of periodsFor(event.date)) {
      const key = `${period}:${login}:${event.locale}/${event.hash}:${event.action}`
      if (counted.has(key)) {
        continue
      }
      counted.add(key)
      let byLogin = counts.get(period)
      if (!byLogin) {
        byLogin = new Map()
        counts.set(period, byLogin)
      }
      let total = byLogin.get(login)
      if (!total) {
        total = { edited: 0, verified: 0, rejected: 0 }
        byLogin.set(login, total)
      }
      total[event.action] += 1
    }
  }
  return counts
}
