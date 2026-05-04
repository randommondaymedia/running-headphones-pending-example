// /go/[slug] — server-rendered redirect endpoint.
// Resolves the slug to a destination URL via the hub API and 302s the
// visitor onward. This file MUST stay server-rendered (not prerendered)
// so the click is recorded server-side at request time.

export const prerender = false;

export async function GET({ params, request, redirect }) {
  const slug = String(params.slug ?? '');
  const apiUrl = import.meta.env.HUB_API_URL;
  const siteId = import.meta.env.SITE_ID;

  if (!slug || !apiUrl || !siteId) {
    return redirect('https://www.amazon.com/', 302);
  }

  try {
    const res = await fetch(`${apiUrl}/api/links/click`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        slug,
        siteId,
        referrer: request.headers.get('referer') ?? '',
        userAgent: request.headers.get('user-agent') ?? '',
        ip: request.headers.get('x-forwarded-for') ?? '',
      }),
    });
    if (res.ok) {
      const { destinationUrl } = (await res.json()) as { destinationUrl: string | null };
      if (destinationUrl) return redirect(destinationUrl, 302);
    }
  } catch {
    // fall through to default Amazon homepage
  }

  return redirect('https://www.amazon.com/', 302);
}
