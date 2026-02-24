"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import bestData from '../data/best.json'
import matchesData from '../data/matches.json'

type BetStatus = 'PENDING' | 'WON' | 'LOST'
type BetPick = 'HOME' | 'DRAW' | 'AWAY'

type Bet = {
  id: string
  matchId: string
  placedAt: string
  pick: BetPick | string
  odd: number
  status: BetStatus | string
}

type Match = {
  id: string
  league: { name: string }
  homeTeam: { name: string; shortName?: string }
  awayTeam: { name: string; shortName?: string }
}

function pickTo1X2(pick: BetPick | string) {
  if (pick === 'HOME') return '1'
  if (pick === 'DRAW') return 'X'
  if (pick === 'AWAY') return '2'
  return String(pick)
}

function statusLabel(status: BetStatus | string) {
  if (status === 'WON') return 'WON'
  if (status === 'LOST') return 'LOST'
  return 'PENDING'
}

function statusClasses(status: BetStatus | string) {
  const normalized = statusLabel(status)
  if (normalized === 'WON') return 'border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900 dark:text-green-200'
  if (normalized === 'LOST') return 'border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-200'
  return 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
}


export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bets, setBets] = useState<Bet[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/signin');
      return;
    }
    setTimeout(() => setLoading(false), 1000);
    setBets((bestData as unknown as { bets: Bet[] }).bets ?? []);
    setMatches((matchesData as unknown as { matches: Match[] }).matches ?? []);
  }, [session, status, router]);

  const matchById = new Map(matches.map((m: Match) => [m.id, m]));
  const sorted = [...bets].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <span className="text-zinc-400 text-lg">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Mis apuestas</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Solo se muestran las apuestas realizadas por el usuario.
          </p>
        </header>
        <main className="mt-6">
          {loading ? (
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((s) => (
                <section
                  key={s}
                  className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-black animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-3 w-12 rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    {[1, 2].map((i) => (
                      <article
                        key={i}
                        className="rounded-xl border border-black/10 p-4 dark:border-white/15 bg-zinc-50 dark:bg-zinc-900"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700 mb-1" />
                          <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
                        </div>
                        <div className="mt-3">
                          <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800 mb-2" />
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map((j) => (
                              <div
                                key={j}
                                className="h-10 rounded-xl border border-black/10 bg-zinc-100 dark:border-white/15 dark:bg-zinc-800"
                              />
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-zinc-600 dark:border-white/15 dark:bg-black dark:text-zinc-400">
              Aún no tienes apuestas.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sorted.map((bet) => {
                const match = matchById.get(bet.matchId) as Match | undefined;
                const teams = match
                  ? `${match.homeTeam.name} vs ${match.awayTeam.name}`
                  : `Partido: ${bet.matchId}`;
                const selection = pickTo1X2(bet.pick);
                const status = statusLabel(bet.status);
                return (
                  <article
                    key={bet.id}
                    className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-black"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-base font-medium">{teams}</div>
                        {match?.league?.name ? (
                          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{match.league.name}</div>
                        ) : null}
                      </div>
                      <div className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${statusClasses(status)}`}>
                        {status}
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/15">
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">Selección</div>
                        <div className="mt-1 text-base font-semibold">{selection}</div>
                      </div>
                      <div className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/15">
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">Cuota</div>
                        <div className="mt-1 text-base font-semibold">{Number(bet.odd).toFixed(2)}</div>
                      </div>
                      <div className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/15">
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">Fecha</div>
                        <div className="mt-1 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                          {new Date(bet.placedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
