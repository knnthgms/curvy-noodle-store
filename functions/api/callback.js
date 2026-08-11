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

// Sends a postMessage to the Decap CMS opener window, then closes the popup.
// The message format is the protocol Decap CMS expects:
//   "authorization:<provider>:<status>:<json-payload>"
function sendToCms(status, payload) {
  const provider = 'github';
  // JSON.stringify the full message string so it is safely embedded in the script.
  const message = JSON.stringify(
    `authorization:${provider}:${status}:${JSON.stringify(payload)}`,
  );

  return new Response(
    `<!doctype html>
<html><head><meta charset="utf-8"></head><body>
<script>
  (function () {
    var msg = ${message};
    if (window.opener) window.opener.postMessage(msg, '*');
    window.close();
  })();
</script>
</body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}
