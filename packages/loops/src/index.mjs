export function buildHeartbeatPlan({ exploit = [], explore = [], tuner = {}, confidence }) {
  return {
    ts: new Date().toISOString(),
    confidence,
    lanes: {
      exploit,
      explore,
      basket: [...exploit, ...explore]
    },
    tuner
  };
}

export function summarizeLaneScorecards(poolBacktests = []) {
  const lanes = { exploit: [], explore: [], unclassified: [] };
  for (const row of poolBacktests) {
    lanes[row.lane || 'unclassified'].push(row);
  }

  const agg = (rows) => {
    if (!rows.length) return null;
    const totalTrades = rows.reduce((s, x) => s + Number(x.trades || 0), 0);
    const avgEdgeBps = rows.reduce((s, x) => s + Number(x.netEdgeBps || 0), 0) / rows.length;
    const worstDrawdownPct = Math.max(...rows.map((x) => Number(x.worstDrawdownPct || 0)));
    return {
      pools: rows.length,
      totalTrades,
      avgEdgeBps: Number(avgEdgeBps.toFixed(3)),
      worstDrawdownPct: Number(worstDrawdownPct.toFixed(3))
    };
  };

  return {
    exploit: agg(lanes.exploit),
    explore: agg(lanes.explore),
    unclassified: agg(lanes.unclassified)
  };
}
