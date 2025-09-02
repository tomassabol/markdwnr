import { convertUrlToMarkdown, normalizeUrl } from "~/lib/convert";

export async function GET(request: Request) {
  try {
    const pathname = new URL(request.url).pathname;
    const sliced = pathname.slice(1);
    // Try to decode if already percent-encoded; if decoding fails, fall back to raw
    let raw: string;
    try {
      raw = decodeURIComponent(sliced);
    } catch {
      raw = sliced;
    }

    // Fix common one-slash mistakes like `https:/example.com` → `https://example.com`
    raw = raw.replace(/^https?:\/(?!\/)/i, (match) => match + "/");
    if (!raw) {
      return new Response(
        `<!doctype html><html><body><pre>No URL provided.</pre></body></html>`,
        { status: 400, headers: { "content-type": "text/html; charset=utf-8" } }
      );
    }

    const url = normalizeUrl(raw);
    const { markdown } = await convertUrlToMarkdown(url, "article");

    return new Response(markdown, {
      status: 200,
      headers: { "content-type": "text/markdown; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    const html =
      `<!doctype html><html><body><main style="padding:24px;font-family:ui-sans-serif,system-ui">` +
      `<h2>Conversion Failed</h2>` +
      `<pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>` +
      `</main></body></html>`;
    return new Response(html, {
      status: 400,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
