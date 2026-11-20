import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import { getAgentProfile, profile } from "@/app/lib/profile";

export const metadata: Metadata = {
  title: "Agent view | Shrit Shrivastava",
  description: "Shrit Shrivastava's structured profile: current projects, writing, official links, and contact information for AI assistants and curious humans.",
  alternates: { canonical: "/agent" },
  openGraph: { title: "Shrit Shrivastava | Agent view", description: profile.description, url: "/agent" },
};

export default function AgentPage() {
  const prompt = encodeURIComponent(`Read ${profile.url}/llms.txt and tell me about Shrit Shrivastava, what he is building, and what he writes about. Cite the original sources and distinguish facts from inference.`);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-12 sm:px-8 sm:pt-20">
        <div className="font-mono text-xs leading-7 text-muted sm:text-sm">
          <h1 className="text-ink">// agent view</h1>
          <p>A structured profile for crawlers, AI assistants, and curious humans.</p>
          <p>Plain text: <a className="link text-ink" href="/llms.txt">/llms.txt</a> <span aria-hidden>·</span> JSON: <a className="link text-ink" href="/agent.json">/agent.json</a></p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 font-mono text-xs">
          <a className="press rounded-md border border-line px-4 py-3 hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-4" href={`https://chatgpt.com/?q=${prompt}`} target="_blank" rel="noopener noreferrer">Ask ChatGPT about me ↗</a>
          <a className="press rounded-md border border-line px-4 py-3 hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-4" href={`https://claude.ai/new?q=${prompt}`} target="_blank" rel="noopener noreferrer">Ask Claude about me ↗</a>
        </div>
        <section aria-label="Structured profile" className="mt-10 border-t border-line pt-8">
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-7 text-ink sm:text-sm">{JSON.stringify(getAgentProfile(), null, 2)}</pre>
        </section>
      </main>
    </>
  );
}
