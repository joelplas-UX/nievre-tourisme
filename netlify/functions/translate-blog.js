/**
 * Vertaalt een blogpost van Frans naar Engels en Nederlands via Claude.
 * POST { titleFr, excerptFr, contentFr, categoryFr }
 * Returns { titleEn, titleNl, excerptEn, excerptNl, contentEn, contentNl, categoryEn, categoryNl }
 */

import Anthropic from '@anthropic-ai/sdk';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS, body: 'Invalid JSON' };
  }

  const { titleFr, excerptFr, contentFr, categoryFr } = body;
  if (!titleFr) {
    return { statusCode: 400, headers: CORS, body: 'titleFr is required' };
  }

  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  const prompt = `Je bent een professionele vertaler voor een toeristische website over de Nièvre en Morvan (Frankrijk).

Vertaal de volgende blogpost-onderdelen van FRANS naar ENGELS en NEDERLANDS.
Behoud de HTML-opmaak exact (tags, attributen). Vertaal alleen de tekst binnen de tags.
Maak de tekst licht redewijsend zodat hij natuurlijk klinkt in de doeltaal.

Geef de output als geldige JSON (geen markdown):
{
  "titleEn": "...",
  "titleNl": "...",
  "excerptEn": "...",
  "excerptNl": "...",
  "contentEn": "... (HTML behouden) ...",
  "contentNl": "... (HTML behouden) ...",
  "categoryEn": "...",
  "categoryNl": "..."
}

--- TITEL (FR) ---
${titleFr}

--- SAMENVATTING (FR) ---
${excerptFr || ''}

--- CATEGORIE (FR) ---
${categoryFr || 'Guide'}

--- INHOUD (FR, HTML) ---
${(contentFr || '').slice(0, 6000)}`;

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = msg.content[0]?.text?.trim() || '{}';
    const cleaned = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
    const result = JSON.parse(cleaned);

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error('Vertaling mislukt:', err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
