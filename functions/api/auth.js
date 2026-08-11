// Cloudflare Pages Function — starts the GitHub OAuth flow for Decap CMS.
// Required environment variables (set in Cloudflare Pages → Settings → Environment Variables):
//   GITHUB_CLIENT_ID     — from your GitHub OAuth App
//   GITHUB_CLIENT_SECRET — from your GitHub OAuth App
//
// The GitHub OAuth App's "Authorization callback URL" must be set to:
//   https://<your-domain>/api/callback

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  if (!env.GITHUB_CLIENT_ID) {
    return new Response('GITHUB_CLIENT_ID is not configured.', { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope: 'public_repo',
    redirect_uri: `${url.origin}/api/callback`,
    // state prevents CSRF — Decap CMS validates it on return
    state: crypto.randomUUID(),
  });

  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
    302,
  );
}
