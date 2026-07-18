export function buildPrayer(words: any[]) {
  const sequence = words.map((w) => w.word);
  const meanings = words.map((w) => w.meaning).join(" -> ");

  return {
    sequence,
    meaningFlow: meanings,
    prayer: `Father, lead me through ${meanings.toLowerCase()} according to Your promise.`,
    declaration: `I walk in ${meanings.toLowerCase()} by God's grace.`
  };
}
