import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { countTranslations, readTranslationEvents, type TranslationEvent } from '../../scripts/utils/translations'

const MT = { model: 'anthropic/claude-sonnet-5.5', promptVersion: '1', candidate: 'Texte machine.' }
const NUXTBOT = { name: 'nuxtbot', email: '132644279+nuxtbot@users.noreply.github.com' }
const APP = { name: 'nuxt-translations[bot]', email: '351752760+nuxt-translations[bot]@users.noreply.github.com' }

const record = (hash: string, fields: Record<string, unknown> = {}) => ({
  hash,
  source: `Source ${hash}.`,
  text: 'Texte machine.',
  origin: 'mt',
  review: 'none',
  derived: 'fresh',
  mt: MT,
  updatedAt: '2026-11-01T00:00:00.000Z',
  ...fields,
})

const edited = (hash: string, by: string, updatedAt: string) =>
  record(hash, { text: `Texte de ${by}.`, origin: 'human', review: 'edited', by, updatedAt })

let dir: string

const commit = (
  date: string,
  author: { name: string, email: string },
  message: string,
  records: Record<string, unknown>[],
  committer = author,
) => {
  for (const item of records) {
    const hash = item.hash as string
    const file = join(dir, 'fr/segments', hash.slice(0, 2), `${hash}.json`)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, `${JSON.stringify(item, null, 2)}\n`)
  }
  git(['add', '-A'])
  git(['commit', '--quiet', '--allow-empty', '-m', message], {
    GIT_AUTHOR_NAME: author.name,
    GIT_AUTHOR_EMAIL: author.email,
    GIT_AUTHOR_DATE: date,
    GIT_COMMITTER_NAME: committer.name,
    GIT_COMMITTER_EMAIL: committer.email,
    GIT_COMMITTER_DATE: date,
  })
}

const git = (args: string[], env: Record<string, string> = {}) =>
  execFileSync('git', ['-c', 'commit.gpgsign=false', ...args], { cwd: dir, env: { ...process.env, ...env }, encoding: 'utf8' })

const A = 'aa00000000000001'
const B = 'bb00000000000002'
const C = 'cc00000000000003'
const D = 'dd00000000000004'
const E = 'ee00000000000005'
const F = 'ff00000000000006'

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'nuxters-translations-test-'))
  git(['init', '--quiet', '--initial-branch', 'main'])
  commit('2026-11-01T00:00:00Z', NUXTBOT, 'chore(fr): translate 4 segments, update 0, carry 0', [record(A), record(B), record(C), record(D)])
  commit('2026-11-02T10:00:00Z', { name: 'HugoRCD', email: '71938701+HugoRCD@users.noreply.github.com' }, 'chore(fr): edit 1 on /docs/4.x/getting-started/installation', [
    edited(A, 'HugoRCD', '2026-11-02T09:59:58.000Z'),
  ], APP)
  commit('2026-11-03T12:00:00Z', APP, 'chore(fr): suggestions from @D3ller (#9)\n\nCo-authored-by: D3ller <64921289+D3ller@users.noreply.github.com>', [
    edited(B, 'D3ller', '2026-11-03T08:00:00.000Z'),
  ], { name: 'GitHub', email: 'noreply@github.com' })
  commit('2026-11-04T10:00:00Z', { name: 'danielroe', email: '28706372+danielroe@users.noreply.github.com' }, 'chore(fr): review 2 on /docs/4.x/getting-started/introduction', [
    record(C, { review: 'verified', verifiedBy: { by: 'danielroe', at: '2026-11-04T09:59:00.000Z' }, updatedAt: '2026-11-04T09:59:00.000Z' }),
    record(D, { review: 'rejected', rejectedBy: { by: 'danielroe', at: '2026-11-04T09:59:30.000Z' }, updatedAt: '2026-11-04T09:59:30.000Z' }),
  ], APP)
  commit('2026-11-05T04:00:00Z', NUXTBOT, 'chore(fr): translate 1 segments, update 1, carry 1', [
    record(E),
    record(F, { text: 'Texte de HugoRCD.', origin: 'human', derived: 'carry', prev: A, updatedAt: '2026-11-05T04:00:00.000Z' }),
    record(B, { text: 'Texte machine mis à jour.', derived: 'update', prev: B, updatedAt: '2026-11-05T04:00:00.000Z' }),
  ])
  commit('2026-11-06T10:00:00Z', { name: 'danielroe', email: '28706372+danielroe@users.noreply.github.com' }, 'chore(fr): verify 1 on /docs/4.x/getting-started/installation', [
    { ...edited(A, 'HugoRCD', '2026-11-06T09:59:00.000Z'), review: 'verified', verifiedBy: { by: 'danielroe', at: '2026-11-06T09:59:00.000Z' } },
  ], APP)
  git(['revert', '--no-edit', 'HEAD'], {
    GIT_AUTHOR_NAME: 'danielroe',
    GIT_AUTHOR_EMAIL: '28706372+danielroe@users.noreply.github.com',
    GIT_AUTHOR_DATE: '2026-11-07T10:00:00Z',
    GIT_COMMITTER_NAME: 'danielroe',
    GIT_COMMITTER_EMAIL: '28706372+danielroe@users.noreply.github.com',
    GIT_COMMITTER_DATE: '2026-11-07T10:00:00Z',
  })
  commit('2026-11-08T10:00:00Z', { name: 'HugoRCD', email: '71938701+HugoRCD@users.noreply.github.com' }, 'chore(fr): edit 1 on /docs/4.x/getting-started/installation', [
    edited(A, 'HugoRCD', '2026-11-08T09:59:00.000Z'),
  ], APP)
  git(['checkout', '--quiet', '-b', 'suggest/D3ller/fr'])
  commit('2026-11-09T10:00:00Z', APP, 'chore(fr): suggest 1 on /docs/4.x/getting-started/installation', [
    edited(E, 'D3ller', '2026-11-09T09:59:00.000Z'),
  ])
  git(['checkout', '--quiet', 'main'])
})

afterAll(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('readTranslationEvents', () => {
  it('should attribute every review action to the person in the record, dated by the commit that landed it', async () => {
    expect(await readTranslationEvents(join(dir, '.git'))).toEqual([
      { action: 'edited', login: 'HugoRCD', locale: 'fr', hash: A, date: '2026-11-02T10:00:00.000Z' },
      { action: 'edited', login: 'D3ller', locale: 'fr', hash: B, date: '2026-11-03T12:00:00.000Z' },
      { action: 'verified', login: 'danielroe', locale: 'fr', hash: C, date: '2026-11-04T10:00:00.000Z' },
      { action: 'rejected', login: 'danielroe', locale: 'fr', hash: D, date: '2026-11-04T10:00:00.000Z' },
      { action: 'verified', login: 'danielroe', locale: 'fr', hash: A, date: '2026-11-06T10:00:00.000Z' },
      { action: 'edited', login: 'HugoRCD', locale: 'fr', hash: A, date: '2026-11-08T10:00:00.000Z' },
    ])
  })

  it('should not count records written by machine translation', async () => {
    const events = await readTranslationEvents(join(dir, '.git'))
    expect(events.filter(event => event.hash === E || event.hash === F || event.date.startsWith('2026-11-05'))).toEqual([])
  })

  it('should not count open suggestions', async () => {
    expect(await readTranslationEvents(join(dir, '.git'), 'suggest/D3ller/fr')).toContainEqual(
      { action: 'edited', login: 'D3ller', locale: 'fr', hash: E, date: '2026-11-09T10:00:00.000Z' },
    )
    expect(await readTranslationEvents(join(dir, '.git'))).not.toContainEqual(expect.objectContaining({ hash: E }))
  })
})

describe('countTranslations', () => {
  const event = (action: TranslationEvent['action'], login: string, hash: string, date: string): TranslationEvent =>
    ({ action, login, locale: 'fr', hash, date })
  const periodsFor = (date: string) => ['all', date.slice(0, 4)]

  it('should count each segment once per person, action and period', () => {
    const counts = countTranslations([
      event('edited', 'HugoRCD', A, '2025-12-31T00:00:00.000Z'),
      event('edited', 'hugorcd', A, '2026-01-02T00:00:00.000Z'),
      event('edited', 'HugoRCD', A, '2026-01-03T00:00:00.000Z'),
      event('verified', 'danielroe', A, '2026-01-04T00:00:00.000Z'),
      event('edited', 'D3ller', A, '2026-01-05T00:00:00.000Z'),
      event('edited', 'D3ller', B, '2026-01-05T00:00:00.000Z'),
      event('rejected', 'danielroe', B, '2026-01-06T00:00:00.000Z'),
      event('verified', 'danielroe', C, '2026-01-07T00:00:00.000Z'),
    ], periodsFor)
    expect(Object.fromEntries([...counts].map(([period, byLogin]) => [period, Object.fromEntries(byLogin)]))).toEqual({
      all: {
        hugorcd: { edited: 1, verified: 0, rejected: 0 },
        danielroe: { edited: 0, verified: 2, rejected: 1 },
        d3ller: { edited: 2, verified: 0, rejected: 0 },
      },
      2025: {
        hugorcd: { edited: 1, verified: 0, rejected: 0 },
      },
      2026: {
        hugorcd: { edited: 1, verified: 0, rejected: 0 },
        danielroe: { edited: 0, verified: 2, rejected: 1 },
        d3ller: { edited: 2, verified: 0, rejected: 0 },
      },
    })
  })
})
