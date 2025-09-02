import TurndownService from "turndown";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

function createTurndown(): TurndownService {
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    bulletListMarker: "-",
  });

  // Preserve line breaks inside paragraphs
  turndown.addRule("lineBreaks", {
    filter: ["br"],
    replacement: () => "\n",
  });

  // Improve code/pre conversion
  const preCodeRule: TurndownService.Rule = {
    filter: (node: TurndownService.Node) =>
      node.nodeName === "PRE" &&
      node.firstChild != null &&
      node.firstChild.nodeName === "CODE",
    replacement: (_content: string, node: TurndownService.Node) => {
      const first = node.firstChild as { textContent?: string } | null;
      const code = first?.textContent || "";
      return "\n\n```\n" + code.replace(/\n+$/, "") + "\n```\n\n";
    },
  };
  turndown.addRule("preCode", preCodeRule);

  return turndown;
}

async function fetchHtml(
  inputUrl: string
): Promise<{ html: string; finalUrl: string }> {
  const response = await fetch(inputUrl, {
    redirect: "follow",
    headers: {
      // Present as a real browser to avoid bot blocks
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 markdwnr/0.1",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL (status ${response.status})`);
  }
  const html = await response.text();
  const finalUrl = response.url || inputUrl;
  return { html, finalUrl };
}

export async function convertUrlToMarkdown(
  rawUrl: string,
  mode: "article" | "full" = "article"
): Promise<{ markdown: string; title: string; finalUrl: string }> {
  const normalizedUrl = normalizeUrl(rawUrl);
  const { html, finalUrl } = await fetchHtml(normalizedUrl);

  const dom = new JSDOM(html, { url: finalUrl });
  const { document } = dom.window as unknown as { document: Document };

  // Remove noisy elements
  removeBySelectors(document, [
    "script",
    "style",
    "noscript",
    "iframe",
    "svg",
    "canvas",
    "link[rel='preload']",
    "link[rel='prefetch']",
    "header .social",
    "[aria-label='cookie'], [id*='cookie'], .cookie, .cookies",
    "[role='alert']",
    "[data-testid='ad'], .ad, .ads, .advert, [class*='sponsor']",
  ]);

  let contentHtml: string;
  let title = document.title || normalizedUrl;

  if (mode === "article") {
    const cloned = document.cloneNode(true) as Document;
    const reader = new Readability(cloned);
    const article = reader.parse();
    if (article && article.content) {
      title = article.title || title;
      contentHtml = article.content;
    } else {
      contentHtml = document.body?.innerHTML || "";
    }
  } else {
    contentHtml = document.body?.innerHTML || "";
  }

  const turndown = createTurndown();
  const markdown = turndown.turndown(contentHtml).trim();

  return { markdown, title, finalUrl };
}

export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    return new URL(url).toString();
  } catch {
    throw new Error("Invalid URL provided");
  }
}

function removeBySelectors(document: Document, selectors: string[]): void {
  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach((el) => el.remove());
  }
}
