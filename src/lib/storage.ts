import {
  COURTS,
  RANDOM_ROUNDS,
  RANKING_NOISE,
  TIE_POINTS,
  TOTAL_ROUNDS,
  WIN_POINTS,
} from '../config';
import type { MatchResult, PlayerMatchHistory, RoundHistory, RoundRecord } from '../types';

export function getActivePlayerCount(totalPlayers: number): number {
  const cap = Math.min(totalPlayers, COURTS * 4);
  return Math.floor(cap / 4) * 4;
}

export function getByeCount(totalPlayers: number): number {
  return Math.max(0, totalPlayers - getActivePlayerCount(totalPlayers));
}

export function getByeInfo(totalPlayers: number): { active: number; byes: number } {
  const active = getActivePlayerCount(totalPlayers);
  return { active, byes: totalPlayers - active };
}

export function createBaseRoundHistory(): RoundHistory {
  return {
    byeCounts: {},
    lastByeRound: {},
    lastByeTimestamp: {},
    partnerCounts: {},
    opponentCounts: {},
    courtCounts: {},
    playerStats: {},
  };
}

export function shuffle<T>(values: T[]): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildRoundHistoryFromRounds(rounds: RoundRecord[]): RoundHistory {
  const history = createBaseRoundHistory();

  for (const round of rounds) {
    for (const bye of round.byes) {
      history.byeCounts[bye] = (history.byeCounts[bye] ?? 0) + 1;
      history.lastByeRound[bye] = round.roundNumber;
      history.lastByeTimestamp[bye] = round.roundNumber;
    }

    for (const match of round.matches) {
      const allPlayers = [...match.teamA, ...match.teamB];
      const pairA = match.teamA.slice();
      const pairB = match.teamB.slice();

      for (const name of pairA) {
        history.partnerCounts[`${name}:${pairA[1]}`] = (history.partnerCounts[`${name}:${pairA[1]}`] ?? 0) + 1;
        history.partnerCounts[`${pairA[1]}:${name}`] = (history.partnerCounts[`${pairA[1]}:${name}`] ?? 0) + 1;
      }

      for (const name of pairB) {
        history.partnerCounts[`${name}:${pairB[1]}`] = (history.partnerCounts[`${name}:${pairB[1]}`] ?? 0) + 1;
        history.partnerCounts[`${pairB[1]}:${name}`] = (history.partnerCounts[`${pairB[1]}:${name}`] ?? 0) + 1;
      }

      const opponents = [
        [match.teamA[0], match.teamA[1], match.teamB[0], match.teamB[1]],
        [match.teamA[0], match.teamA[1], match.teamB[1], match.teamB[0]],
      ];

      for (const name of allPlayers) {
        for (const other of allPlayers) {
          if (name !== other) {
            history.opponentCounts[`${name}:${other}`] = (history.opponentCounts[`${name}:${other}`] ?? 0) + 1;
          }
        }
      }

      for (const opponentPair of opponents) {
        // this keeps the history shape usable without affecting the tournament logic heavily
      }
    }
  }

  return history;
}

function computePlayerStatsFromRounds(rounds: RoundRecord[]): Record<string, PlayerMatchHistory> {
  const stats: Record<string, PlayerMatchHistory> = {};

  for (const round of rounds) {
    for (const match of round.matches) {
      const { teamA, teamB, scoreA, scoreB } = match;
      const aPoints = scoreA > scoreB ? WIN_POINTS : scoreA === scoreB ? TIE_POINTS : 0;
      const bPoints = scoreB > scoreA ? WIN_POINTS : scoreA === scoreB ? TIE_POINTS : 0;

      for (const player of teamA) {
        const entry = stats[player] ?? {
          name: player,
          matchesPlayed: 0,
          byes: 0,
          points: 0,
          gamesWon: 0,
          gamesLost: 0,
          wins: 0,
          ties: 0,
          losses: 0,
        };
        entry.matchesPlayed += 1;
        entry.points += aPoints;
        entry.gamesWon += scoreA;
        entry.gamesLost += scoreB;
        if (scoreA > scoreB) entry.wins += 1;
        else if (scoreA === scoreB) entry.ties += 1;
        else entry.losses += 1;
        stats[player] = entry;
      }

      for (const player of teamB) {
        const entry = stats[player] ?? {
          name: player,
          matchesPlayed: 0,
          byes: 0,
          points: 0,
          gamesWon: 0,
          gamesLost: 0,
          wins: 0,
          ties: 0,
          losses: 0,
        };
        entry.matchesPlayed += 1;
        entry.points += bPoints;
        entry.gamesWon += scoreB;
        entry.gamesLost += scoreA;
        if (scoreB > scoreA) entry.wins += 1;
        else if (scoreA === scoreB) entry.ties += 1;
        else entry.losses += 1;
        stats[player] = entry;
      }
    }

    for (const bye of round.byes) {
      const entry = stats[bye] ?? {
        name: bye,
        matchesPlayed: 0,
        byes: 0,
        points: 0,
        gamesWon: 0,
        gamesLost: 0,
        wins: 0,
        ties: 0,
        losses: 0,
      };
      entry.byes += 1;
      stats[bye] = entry;
    }
  }

  return stats;
}

function calculatePairingCost(
  group: string[],
  pairings: Array<[string, string]>,
  history: RoundHistory,
): number {
  let cost = 0;
  for (const [a, b] of pairings) {
    const key = `${a}:${b}`;
    const reverseKey = `${b}:${a}`;
    const repeatPartner = (history.partnerCounts[key] ?? 0) + (history.partnerCounts[reverseKey] ?? 0);
    cost += repeatPartner * 10;
  }

  const opponents = new Set<string>();
  pairings.forEach(([a, b], index) => {
    const players = [a, b];
    const otherPlayers = group.filter((name) => !players.includes(name));
    const opponentPairings = [
      [pairings[0]?.[0], pairings[0]?.[1]],
      [pairings[1]?.[0], pairings[1]?.[1]],
    ];
    if (index === 0) {
      opponentPairings.forEach(([x, y]) => {
        if (x && y) {
          const key = [a, b, x, y].sort().join('|');
          opponents.add(key);
        }
      });
    }
  });

  // simplified historical opponent cost estimate
  for (const [a, b] of pairings) {
    const count = (history.opponentCounts[`${a}:${b}`] ?? 0) + (history.opponentCounts[`${b}:${a}`] ?? 0);
    cost += count * 3;
  }

  cost += Math.random();
  return cost;
}

function pairingOptions(group: string[]): Array<[string, string][]> {
  const [a, b, c, d] = group;
  return [
    [[a, b], [c, d]],
    [[a, c], [b, d]],
    [[a, d], [b, c]],
  ];
}

function scoreTiedByes(players: string[], history: RoundHistory, roundNumber: number): string[] {
  const counts = players.reduce<Record<string, number>>((acc, name) => {
    acc[name] = history.byeCounts[name] ?? 0;
    return acc;
  }, {});

  const previousBye = players.filter((player) => (history.lastByeRound[player] ?? -1) === roundNumber - 1);

  const sorted = [...players].sort((a, b) => {
    const countDiff = (counts[a] ?? 0) - (counts[b] ?? 0);
    if (countDiff !== 0) return countDiff;
    const aPrev = previousBye.includes(a) ? 1 : 0;
    const bPrev = previousBye.includes(b) ? 1 : 0;
    if (aPrev !== bPrev) return aPrev - bPrev;
    const aGap = roundNumber - (history.lastByeRound[a] ?? -9999);
    const bGap = roundNumber - (history.lastByeRound[b] ?? -9999);
    if (aGap !== bGap) return bGap - aGap;
    return Math.random() - 0.5;
  });

  return sorted.slice(0, getByeCount(players.length));
}

export function selectByes(players: string[], history: RoundHistory, roundNumber: number): string[] {
  const activeCount = getActivePlayerCount(players.length);
  const byeCount = Math.max(0, players.length - activeCount);
  if (byeCount === 0) return [];

  const remaining = [...players].sort((a, b) => {
    const aCount = history.byeCounts[a] ?? 0;
    const bCount = history.byeCounts[b] ?? 0;
    if (aCount !== bCount) return aCount - bCount;
    const aPrev = (history.lastByeRound[a] ?? -Infinity) === roundNumber - 1 ? 1 : 0;
    const bPrev = (history.lastByeRound[b] ?? -Infinity) === roundNumber - 1 ? 1 : 0;
    if (aPrev !== bPrev) return aPrev - bPrev;
    const aGap = roundNumber - (history.lastByeRound[a] ?? -9999);
    const bGap = roundNumber - (history.lastByeRound[b] ?? -9999);
    if (aGap !== bGap) return bGap - aGap;
    return Math.random() - 0.5;
  });

  return remaining.slice(0, byeCount);
}

export function generateRound(
  players: string[],
  history: RoundHistory,
  settings: { roundNumber: number },
  roundNumber = settings.roundNumber,
): { matches: MatchResult[]; byes: string[] } {
  const safePlayers = [...players].filter(Boolean);
  const activeCount = getActivePlayerCount(safePlayers.length);
  const byeCandidates = selectByes(safePlayers, history, roundNumber);
  const activePlayers = safePlayers.filter((player) => !byeCandidates.includes(player));

  if (activePlayers.length === 0) {
    return { matches: [], byes: byeCandidates };
  }

  const roundPlayers = activePlayers.length > 0 ? activePlayers : safePlayers;
  const groups: string[][] = [];
  for (let i = 0; i < roundPlayers.length; i += 4) {
    groups.push(roundPlayers.slice(i, i + 4));
  }

  const candidateMatches: MatchResult[] = [];
  if (roundNumber <= RANDOM_ROUNDS) {
    let bestCost = Number.POSITIVE_INFINITY;
    let bestMatches: MatchResult[] = [];

    for (let trial = 0; trial < 3000; trial += 1) {
      const shuffled = [...roundPlayers];
      const randomized = shuffle(shuffled);
      const currentGroups: string[][] = [];
      for (let g = 0; g < randomized.length; g += 4) {
        currentGroups.push(randomized.slice(g, g + 4));
      }

      const roundMatches: MatchResult[] = [];
      let totalCost = 0;

      for (const group of currentGroups) {
        if (group.length < 4) continue;
        let bestGroupCost = Number.POSITIVE_INFINITY;
        let bestGrouping: [string, string][] = [];

        const options = pairingOptions(group);
        for (const option of options) {
          const cost = calculatePairingCost(group, option, history);
          if (cost < bestGroupCost) {
            bestGroupCost = cost;
            bestGrouping = option;
          }
        }

        totalCost += bestGroupCost;
        roundMatches.push({
          teamA: [bestGrouping[0][0], bestGrouping[0][1]],
          teamB: [bestGrouping[1][0], bestGrouping[1][1]],
          scoreA: 0,
          scoreB: 0,
        });
      }

      if (totalCost < bestCost) {
        bestCost = totalCost;
        bestMatches = roundMatches;
      }
    }

    return { matches: bestMatches, byes: byeCandidates };
  }

  for (const group of groups) {
    if (group.length < 4) continue;
    let bestCost = Number.POSITIVE_INFINITY;
    let bestOption: [string, string][] = [];

    for (const option of pairingOptions(group)) {
      const cost = calculatePairingCost(group, option, history);
      if (cost < bestCost) {
        bestCost = cost;
        bestOption = option;
      }
    }

    candidateMatches.push({
      teamA: [bestOption[0][0], bestOption[0][1]],
      teamB: [bestOption[1][0], bestOption[1][1]],
      scoreA: 0,
      scoreB: 0,
    });
  }

  return { matches: candidateMatches, byes: byeCandidates };
}

export function rankPlayers(players: string[], rounds: RoundRecord[]): Array<{ name: string; totalPoints: number; matchesPlayed: number; byes: number; avgPoints: number; avgGameDifferential: number; wins: number; ties: number; losses: number; gamesWon: number; gamesLost: number }> {
  const stats: Record<string, PlayerMatchHistory> = computePlayerStatsFromRounds(rounds);

  for (const player of players) {
    const entry = stats[player] ?? {
      name: player,
      matchesPlayed: 0,
      byes: 0,
      points: 0,
      gamesWon: 0,
      gamesLost: 0,
      wins: 0,
      ties: 0,
      losses: 0,
    };
    stats[player] = entry;
  }

  return [...players]
    .map((name) => {
      const player = stats[name] ?? {
        name,
        matchesPlayed: 0,
        byes: 0,
        points: 0,
        gamesWon: 0,
        gamesLost: 0,
        wins: 0,
        ties: 0,
        losses: 0,
      };
      return {
        name,
        totalPoints: player.points,
        matchesPlayed: player.matchesPlayed,
        byes: player.byes,
        avgPoints: player.matchesPlayed > 0 ? player.points / player.matchesPlayed : 0,
        avgGameDifferential: player.matchesPlayed > 0 ? (player.gamesWon - player.gamesLost) / player.matchesPlayed : 0,
        wins: player.wins,
        ties: player.ties,
        losses: player.losses,
        gamesWon: player.gamesWon,
        gamesLost: player.gamesLost,
      };
    })
    .sort((a, b) => {
      if (a.matchesPlayed === 0 && b.matchesPlayed !== 0) return 1;
      if (a.matchesPlayed !== 0 && b.matchesPlayed === 0) return -1;
      if (a.avgPoints !== b.avgPoints) return b.avgPoints - a.avgPoints;
      if (a.avgGameDifferential !== b.avgGameDifferential) return b.avgGameDifferential - a.avgGameDifferential;
      return a.name.localeCompare(b.name);
    });
}

export function getTournamentSummary(players: string[], rounds: RoundRecord[]): { totalPlayers: number; active: number; byes: number; gamesPerRound: number; byesPerRound: number; range: [number, number] } {
  const totalPlayers = players.length;
  const info = getByeInfo(totalPlayers);
  const byesTotal = rounds.reduce((sum, round) => sum + round.byes.length, 0);
  return {
    totalPlayers,
    active: info.active,
    byes: info.byes,
    gamesPerRound: Math.min(COURTS * 4, totalPlayers),
    byesPerRound: info.byes,
    range: [Math.max(0, Math.ceil((byesTotal / totalPlayers) - 1)), Math.max(0, Math.ceil(byesTotal / totalPlayers) + 1)],
  };
}

export function exportResultsCsv(players: string[], rounds: RoundRecord[]): string {
  const rows: string[] = [];
  rows.push(['player', 'rounds_played', 'byes', 'avg_points', 'total_points', 'avg_game_diff', 'wins', 'ties', 'losses', 'games_won', 'games_lost'].join(','));

  const standings = rankPlayers(players, rounds);
  for (const player of standings) {
    rows.push([
      player.name,
      player.matchesPlayed,
      player.byes,
      player.avgPoints.toFixed(2),
      player.totalPoints,
      player.avgGameDifferential.toFixed(2),
      player.wins,
      player.ties,
      player.losses,
      player.gamesWon,
      player.gamesLost,
    ].join(','));
  }

  return rows.join('\n');
}

export function createDemoRoundScores(round: RoundRecord): RoundRecord {
  return {
    ...round,
    matches: round.matches.map((match) => ({
      ...match,
      scoreA: Math.floor(Math.random() * 6),
      scoreB: Math.floor(Math.random() * 6),
    })),
    submitted: true,
  };
}

export function isRoundReady(round: RoundRecord): boolean {
  return round.matches.length > 0 && round.matches.every((match) => match.scoreA !== undefined && match.scoreB !== undefined && match.scoreA >= 0 && match.scoreB >= 0);
}

export function uniqueValidPlayers(players: string[]): string[] {
  const seen = new Set<string>();
  return players.filter((player) => {
    const cleaned = player.trim();
    if (!cleaned) return false;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function determineWinner(players: string[], rounds: RoundRecord[]): string | null {
  const leaderboard = rankPlayers(players, rounds);
  return leaderboard.length > 0 ? leaderboard[0].name : null;
}

export function buildLiveInfo(players: string[]): string {
  const total = players.filter((name) => name.trim()).length;
  const { active, byes } = getByeInfo(total);
  const gamesPerRound = active;
  const sitOut = byes;
  const totalByes = byes * TOTAL_ROUNDS;
  const minGames = total === 0 ? 0 : Math.max(0, Math.ceil((total - byes) / 4) * 4);
  const maxGames = total === 0 ? 0 : Math.max(0, total - Math.min(total, byes));

  return `${total} players, ${COURTS} courts → ${gamesPerRound} play per round, ${sitOut} sit out per round. Over ${TOTAL_ROUNDS} rounds, everyone plays between ${Math.max(0, Math.floor(total / 4))} and ${Math.max(0, Math.ceil(total / 2))} games.`;
}

export function normalizeName(name: string): string {
  return name.trim();
}

export function parseRoundNumbersFromScores(rounds: RoundRecord[]): number {
  return rounds.filter((round) => round.submitted).length;
}

export const tournamentSettings = {
  totalRounds: TOTAL_ROUNDS,
  courts: COURTS,
  randomRounds: RANDOM_ROUNDS,
  rankingNoise: RANKING_NOISE,
  winPoints: WIN_POINTS,
  tiePoints: TIE_POINTS,
};
