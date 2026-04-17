export default {
  async fetch(request) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === 'POST' && url.pathname === '/api/token') {
      const body = await request.text();
      const resp = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body,
      });
      const data = await resp.text();
      return new Response(data, {
        status: resp.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/me') {
      const auth = request.headers.get('Authorization') || '';
      const resp = await fetch('https://api.mercadolibre.com/users/me', {
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
