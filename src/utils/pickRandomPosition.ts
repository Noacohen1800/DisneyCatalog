// Picks a random position between 1 and total (both included), for the Random page.
// If "current" is given, the answer is never the same as current, so the same
// character is never shown twice in a row (unless there is only one character).
// "random" can be replaced in tests; it must return a number from 0 up to (not including) 1.
export function pickRandomPosition(
  total: number,
  current?: number,
  random: () => number = Math.random,
): number {
  if (!Number.isInteger(total) || total < 1) {
    throw new Error('total must be a whole number of at least 1')
  }

  const canAvoidCurrent =
    current !== undefined && total > 1 && current >= 1 && current <= total

  if (!canAvoidCurrent) {
    return Math.floor(random() * total) + 1
  }

  // Pick from the other (total - 1) positions: choose 1..total-1,
  // then shift everything from "current" upward by one to skip over it.
  const pick = Math.floor(random() * (total - 1)) + 1
  return pick >= current ? pick + 1 : pick
}
