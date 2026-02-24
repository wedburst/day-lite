'use client'

import { useMemo, useState } from 'react'

type Match = {
  id: string
  startTime: string
  league: {
    id: string
    name: string
    country: string
  }
  homeTeam: {
    id: string
    name: string
    shortName: string
  }
  awayTeam: {
    id: string
    name: string
    shortName: string
  }
  market: {
    type: string
    odds: {
      home: number
      draw: number
      away: number
    }
  }
}

type Pick = 'HOME' | 'DRAW' | 'AWAY'

type PlacedBet = {
  matchId: string
  pick: Pick
  odd: number
  placedAt: number
}

type Props = {
  dayLabel: string
  timezone: string
  matches: Match[]
}

function hourLabel(startTime: string) {
  // ISO with offset, e.g. 2026-02-12T19:25:00-05:00
  const hour = startTime.slice(11, 13)
  return `${hour}:00`
}

function pickMeta(pick: Pick) {
  if (pick === 'HOME') return { cta: '1', name: 'Local' }
  if (pick === 'DRAW') return { cta: 'X', name: 'Empate' }
  return { cta: '2', name: 'Visita' }
}

export default function Timeline({ dayLabel, timezone, matches }: Props) {
  const [betsByMatch, setBetsByMatch] = useState<Record<string, PlacedBet>>({})
  const [toast, setToast] = useState<null | { title: string; detail?: string }>(null)

  const groups = useMemo(() => {
    const byHour = new Map<string, Match[]>()

    for (const match of matches) {
      const hour = hourLabel(match.startTime)
      const list = byHour.get(hour)
      if (list) list.push(match)
      else byHour.set(hour, [match])
    }

    const sortedHours = Array.from(byHour.keys()).sort((a, b) => (a < b ? -1 : 1))
    return sortedHours.map((hour) => ({ hour, matches: byHour.get(hour)! }))
  }, [matches])

  function placeBet(match: Match, pick: Pick) {
    const odd =
      pick === 'HOME'
        ? match.market.odds.home
        : pick === 'DRAW'
          ? match.market.odds.draw
          : match.market.odds.away

    setBetsByMatch((prev) => ({
      ...prev,
      [match.id]: {
        matchId: match.id,
        pick,
        odd,
        placedAt: Date.now(),
      },
    }))

    const { cta } = pickMeta(pick)
    setToast({
      title: `Apuesta simulada: ${cta} @ ${odd.toFixed(2)}`,
      detail: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName} • ${match.league.name}`,
    })

    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {dayLabel} • {timezone}
          </p>
        </header>

        {toast ? (
          <div className="sticky top-16 z-10 mt-6">
            <div className="rounded-xl border border-black/10 bg-white px-4 py-3 shadow-sm dark:border-white/15 dark:bg-black">
              <div className="text-sm font-medium">{toast.title}</div>
              {toast.detail ? (
                <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{toast.detail}</div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="h-6" />
        )}

        <main className="mt-6">
          {groups.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-zinc-600 dark:border-white/15 dark:bg-black dark:text-zinc-400">
              No hay eventos para mostrar.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {groups.map((group) => (
                <section
                  key={group.hour}
                  className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-black"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{group.hour}</h2>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {group.matches.length} evento{group.matches.length === 1 ? '' : 's'}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    {group.matches.map((match) => {
                      const existingBet = betsByMatch[match.id]

                      return (
                        <article
                          key={match.id}
                          className="rounded-xl border border-black/10 p-4 dark:border-white/15"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="text-xs text-zinc-600 dark:text-zinc-400">{match.league.name}</div>
                            <div className="text-base font-medium">
                              {match.homeTeam.name}{' '}
                              <span className="text-zinc-500 dark:text-zinc-400">vs</span>{' '}
                              {match.awayTeam.name}
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Mercado 1X2</div>

                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {([
                                { pick: 'HOME' as const, odd: match.market.odds.home },
                                { pick: 'DRAW' as const, odd: match.market.odds.draw },
                                { pick: 'AWAY' as const, odd: match.market.odds.away },
                              ] as const).map(({ pick, odd }) => {
                                const meta = pickMeta(pick)
                                const selected = existingBet?.pick === pick

                                return (
                                  <button
                                    key={pick}
                                    type="button"
                                    onClick={() => placeBet(match, pick)}
                                    className={
                                      'cursor-pointer rounded-xl border px-3 py-3 text-left transition-colors ' +
                                      (selected
                                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                                        : 'border-black/10 bg-white hover:bg-zinc-50 dark:border-white/15 dark:bg-black dark:hover:bg-white/5')
                                    }
                                    aria-pressed={selected}
                                  >
                                    <div className="flex items-baseline justify-between gap-2">
                                      <div className="text-lg font-semibold">{meta.cta}</div>
                                      <div
                                        className={
                                          selected
                                            ? 'text-sm text-white/90 dark:text-black/80'
                                            : 'text-sm text-zinc-600 dark:text-zinc-400'
                                        }
                                      >
                                        {odd.toFixed(2)}
                                      </div>
                                    </div>
                                    <div
                                      className={
                                        selected
                                          ? 'mt-1 text-xs text-white/80 dark:text-black/70'
                                          : 'mt-1 text-xs text-zinc-600 dark:text-zinc-400'
                                      }
                                    >
                                      {meta.name}
                                    </div>
                                  </button>
                                )
                              })}
                            </div>

                            {existingBet ? (
                              <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                                Última apuesta simulada: {pickMeta(existingBet.pick).cta} @ {existingBet.odd.toFixed(2)}
                              </div>
                            ) : null}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
