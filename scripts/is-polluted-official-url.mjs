/** @param {string | undefined} sourceUrl */
export function isPollutedOfficialUrl(sourceUrl) {
  if (!sourceUrl) return true;
  const pollutedPatterns = ['galaxy-s26-ultra', '/s2602/', 'ScomQR_PNG', '/footer/'];
  return pollutedPatterns.some((pattern) => sourceUrl.includes(pattern));
}
