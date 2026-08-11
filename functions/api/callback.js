// Cloudflare Pages Function — GitHub OAuth callback for Decap CMS.
// Exchanges the temporary `code` from GitHub for an access token, then sends
// it back to the Decap CMS popup window via postMessage.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return sendToCms('error', { error: 'Missing OAuth code from GitHub.' });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return sendToCms('error', { error: 'OAuth credentials are not configured on the server.' });
  }

  let data;
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    data = await res.json();
  } catch (err) {
    return sendToCms('error', { error: `Failed to reach GitHub: ${err.message}` });
  }

  if (data.error || !data.access_token) {
    return sendToCms('error', {
      error: data.error_description ?? data.error ?? 'GitHub returned no access token.',
    });
  }

  return sendToCms('success', { token: data.access_token, provider: 'github' });
}

// Sends the result back to the Decap CMS opener window using its two-step
// postMessage handshake, then closes the popup. Decap's protocol is:
//   1. popup  → opener:  "authorizing:github"          (announce we're ready)
//   2. opener → popup:   any message                    (opener is now listening)
//   3. popup  → opener:  "authorization:github:<status>:<json>"  (deliver token)
// Firing step 3 without 1–2 (as the old code did) means the CMS never receives
// the token and stays stuck on the login screen.
function sendToCms(status, payload) {
  const provider = 'github';
  const responseMessage = `authorization:${provider}:${status}:${JSON.stringify(payload)}`;

  return new Response(
    `<!doctype html>
<html><head><meta charset="utf-8"></head><body>
<script>
  (function () {
    function receiveMessage(e) {
      // Reply to the opener that first messaged us, using its exact origin.
      window.opener.postMessage(${JSON.stringify(responseMessage)}, e.origin);
      window.removeEventListener('message', receiveMessage, false);
      window.close();
    }
    window.addEventListener('message', receiveMessage, false);
    // Announce readiness so the CMS wires up its listener and messages back.
    window.opener.postMessage('authorizing:${provider}', '*');
  })();
</script>
</body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}
