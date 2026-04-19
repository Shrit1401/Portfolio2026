import { Research } from "@/app/lib/types";
import ResearchCard from "./ResearchCard";

interface ResearchGridProps {
  research: Research[];
}

export default function ResearchGrid({ research }: ResearchGridProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 pb-16">
      {research.map((item) => (
        <ResearchCard
          key={item.slug.current}
          title={item.title}
          slug={item.slug.current}
          preview={item.description}
          date={item.date}
          tags={item.tags}
        />
      ))}
    </div>
  );
}
