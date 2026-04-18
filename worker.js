export default {
  async fetch(request) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Proxy OAuth token exchange
    if (request.method === 'POST' && url.pathname === '/api/token') {
      const body = await request.text();
      const resp = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body,
      });
      const tokens = await resp.json();
      if (resp.ok && tokens.access_token) {
        const meResp = await fetch('https://api.mercadolibre.com/users/me', {
          headers: { Authorization: 'Bearer ' + tokens.access_token, Accept: 'application/json' },
        });
        const me = await meResp.json();
        tokens._user = { id: me.id, nickname: me.nickname };
      }
      return new Response(JSON.stringify(tokens), {
        status: resp.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Proxy general MELI API calls: /api/meli/orders/search?...
    if (request.method === 'GET' && url.pathname.startsWith('/api/meli/')) {
      const meliPath = url.pathname.replace('/api/meli', '') + url.search;
      const auth = request.headers.get('Authorization') || '';
      const resp = await fetch('https://api.mercadolibre.com' + meliPath, {
        headers: { Authorization: auth, Accept: 'application/json' },
      });
      const data = await resp.text();
      return new Response(data, {
        status: resp.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
