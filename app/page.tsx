import { UrlForm } from "~/components/url-form";

export default function Home() {
  return (
    <div className="font-sans min-h-screen flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <p className="inline-block rounded-full border px-3 py-1 text-xs text-muted-foreground mb-3">
            Supercharge note-taking and citations
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Turn any website into LLM-friendly{" "}
            <span className="bg-gradient-to-r from-foreground to-neutral-400 bg-clip-text text-transparent">
              Markdown
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Paste a URL and press Enter. You&apos;ll be redirected to a Markdown
            view.
          </p>
        </div>

        <UrlForm />
      </div>
    </div>
  );
}
