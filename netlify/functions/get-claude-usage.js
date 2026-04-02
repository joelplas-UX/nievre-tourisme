/**
 * GET /api/get-claude-usage
 * Haalt Claude API-gebruik en kosten op via de Anthropic Admin API.
 * Vereist: ANTHROPIC_ADMIN_KEY env var (sk-ant-admin...)
 * Vereist: organisatie-account op console.anthropic.com
 */

const BASE = 'https://api.anthropic.com';
const HEADERS = () => ({
  'anthropic-version': '2023-06-01',
  'x-api-key': process.env.ANTHROPIC_ADMIN_KEY,
  'Content-Type': 'application/json',
});

function isoDate(d) {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

exports.handler = async () => {
  const adminKey = process.env.ANTHROPIC_ADMIN_KEY;

  if (!adminKey) {
    return {
      statusCode: 200,
      body: JSON.stringify({ available: false, reason: 'no_admin_key' }),
    };
  }

  if (!adminKey.startsWith('sk-ant-admin')) {
    return {
      statusCode: 200,
      body: JSON.stringify({ available: false, reason: 'not_admin_key' }),
    };
  }

  const now   = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  const startStr = isoDate(start);
  const endStr   = isoDate(now);

  try {
    // 1. Kosten per dag (afgelopen 30 dagen)
    const costRes = await fetch(
      `${BASE}/v1/organizations/cost_report?starting_at=${startStr}&ending_at=${endStr}&bucket_width=1d`,
      { headers: HEADERS() }
    );

    // 2. Token-gebruik per model (afgelopen 30 dagen, dagelijks)
    const usageRes = await fetch(
      `${BASE}/v1/organizations/usage_report/messages?starting_at=${startStr}&ending_at=${endStr}&bucket_width=1d&group_by[]=model`,
      { headers: HEADERS() }
    );

    if (!costRes.ok || !usageRes.ok) {
      const errText = await (costRes.ok ? usageRes : costRes).text();
      // Organisatie-account vereist → graceful fallback
      if (errText.includes('organization') || costRes.status === 403 || usageRes.status === 403) {
        return {
          statusCode: 200,
          body: JSON.stringify({ available: false, reason: 'no_organization' }),
        };
      }
      throw new Error(`API fout: ${errText}`);
    }

    const costData  = await costRes.json();
    const usageData = await usageRes.json();

    // Bereken totalen
    let totalCostCents = 0;
    const dailyCosts = [];
    for (const bucket of (costData.buckets || [])) {
      const cents = parseFloat(bucket.total_cost_cents || '0');
      totalCostCents += cents;
      dailyCosts.push({
        date:  bucket.start_time?.slice(0, 10) || '',
        cents: cents,
      });
    }

    // Gebruik per model samenvatten
    const modelTotals = {};
    for (const bucket of (usageData.buckets || [])) {
      for (const entry of (bucket.entries || [])) {
        const model = entry.model || 'onbekend';
        if (!modelTotals[model]) {
          modelTotals[model] = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
        }
        modelTotals[model].input      += entry.input_tokens            || 0;
        modelTotals[model].output     += entry.output_tokens           || 0;
        modelTotals[model].cacheRead  += entry.cache_read_input_tokens || 0;
        modelTotals[model].cacheWrite += entry.cache_creation_input_tokens || 0;
      }
    }

    // 7 dagen geleden
    const week = new Date(now);
    week.setDate(week.getDate() - 7);
    const costLast7 = dailyCosts
      .filter(d => new Date(d.date) >= week)
      .reduce((s, d) => s + d.cents, 0);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        available: true,
        periodDays: 30,
        totalCostCents,
        costLast7Cents: costLast7,
        dailyCosts: dailyCosts.slice(-14), // laatste 14 dagen voor grafiek
        modelTotals,
        fetchedAt: now.toISOString(),
      }),
    };
  } catch (err) {
    console.error('[get-claude-usage]', err.message);
    return {
      statusCode: 200,
      body: JSON.stringify({ available: false, reason: 'error', message: err.message }),
    };
  }
};
