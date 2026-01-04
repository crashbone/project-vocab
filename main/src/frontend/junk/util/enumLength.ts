export const enumLength = <E extends Record<string, string | number>>(e: E): number => {
  const keys = Object.keys(e);
  const hasNumericReverse = keys.some(k => !isNaN(Number(k)));
  return hasNumericReverse
    ? keys.filter(k => isNaN(Number(k))).length
    : keys.length;
}