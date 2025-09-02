"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";

const UrlSchema = z.object({
  url: z.url("Enter a valid URL").min(1, "URL is required"),
});

export function UrlForm() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => inputRef.current?.focus(), []);

  async function handleConvert(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const parsed = UrlSchema.safeParse({ url });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid URL");
      return;
    }
    router.push(`/${encodeURIComponent(parsed.data.url)}`);
  }

  const examples = [
    "https://zod.dev/v4/changelog",
    "https://nextjs.org/blog",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="size-5" aria-hidden />
          Convert URL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleConvert}
          className="grid gap-4"
          aria-label="Convert website to Markdown"
        >
          <div className="grid gap-2">
            <Label htmlFor="url">Website URL</Label>
            <div className=" flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="url"
                  name="url"
                  placeholder="https://example.com/article"
                  inputMode="url"
                  value={url}
                  ref={inputRef}
                  onChange={(e) => setUrl(e.target.value)}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text");
                    if (pasted) setUrl(pasted.trim());
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "url-error" : undefined}
                />
                {url ? (
                  <button
                    type="button"
                    aria-label="Clear URL"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                    onClick={() => {
                      setUrl("");
                      inputRef.current?.focus();
                    }}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <Button type="submit" className="hidden md:block" role="button">
                Convert
              </Button>
            </div>
            <Button type="submit" className="md:hidden">
              Convert
            </Button>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="hidden sm:block">
                Tip: press Enter to convert
              </span>
            </div>
            {error ? (
              <p id="url-error" className="text-sm text-red-600">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 justify-end">
              {examples.map((ex) => (
                <Link href={`/${encodeURIComponent(ex)}`} key={ex}>
                  <Button type="button" variant="outline" size="sm">
                    Try: {new URL(ex).hostname}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
