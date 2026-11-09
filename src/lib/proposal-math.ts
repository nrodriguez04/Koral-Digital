export function proposalTotals(
  items: { quantity: number; unitPriceCents: number }[],
  depositPercent: number,
) {
  const total = items.reduce((a, i) => a + i.quantity * i.unitPriceCents, 0);
  const deposit = Math.round((total * depositPercent) / 100);
  return { total, deposit, balance: total - deposit };
}
