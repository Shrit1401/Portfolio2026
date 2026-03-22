import React, { useEffect, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { getAdjacentResearch } from "@/app/lib/server";
import { urlFor } from "@/sanity/lib/image";

interface NavCard {
  href: string;
  img: string;
  label: string;
}

interface AdjacentResearch {
  previous: {
    slug: string;
    title: string;
    image: any;
  } | null;
  next: {
    slug: string;
    title: string;
    image: any;
  } | null;
}

const ResearchSense = () => {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const [adjacentResearch, setAdjacentResearch] = useState<AdjacentResearch>({
    previous: null,
    next: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdjacentResearch = async () => {
      const slug = pathname.split("/").pop();
      if (slug) {
        const data = await getAdjacentResearch(slug);
        setAdjacentResearch(data);
      }
      setLoading(false);
    };

    fetchAdjacentResearch();
  }, [pathname]);

  function triggerPageTransition() {
    document.documentElement.animate(
      [
        {
          clipPath: "polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)",
        },
        {
          clipPath: "polygon(0 100%, 100% 100%, 100% 0,0 0)",
        },
      ],
      {
        duration: 2000,
        easing: "cubic-bezier(0.9, 0, 0.1, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  }

  const handleNavigation =
    (path?: string) => (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!path || path === pathname) {
        e.preventDefault();
        return;
      }
      router.push(path, {
        onTransitionReady: triggerPageTransition,
      });
    };

  if (loading) {
    return (
      <div className="w-full h-full p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg overflow-hidden relative aspect-[4/3] shadow-lg animate-pulse bg-gray-200" />
          <div className="rounded-lg overflow-hidden relative aspect-[4/3] shadow-lg animate-pulse bg-gray-200" />
        </div>
      </div>
    );
  }

  const backward = adjacentResearch.previous
    ? {
        href: `/research/${adjacentResearch.previous.slug}`,
        img: urlFor(adjacentResearch.previous.image).url(),
        label: `← ${adjacentResearch.previous.title}`,
      }
    : null;

  const forward = adjacentResearch.next
    ? {
        href: `/research/${adjacentResearch.next.slug}`,
        img: urlFor(adjacentResearch.next.image).url(),
        label: `${adjacentResearch.next.title} →`,
      }
    : null;

  // If there are no adjacent items, don't render anything
  if (!backward && !forward) {
    return null;
  }

  return (
    <div className="w-full h-full p-4">
      <div
        className={`grid gap-6 ${backward && forward ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
      >
        {/* Backward Card */}
        {backward && (
          <span
            onClick={handleNavigation(backward.href)}
            className="group block rounded-lg overflow-hidden cursor-pointer relative aspect-[4/3] shadow-lg hover:brightness-125 transition-all duration-300"
            style={{ background: "#111" }}
          >
            <img
              src={backward.img}
              alt={backward.label}
              className="w-full h-full object-cover object-center group-hover:brightness-125 transition-all duration-500"
              draggable="false"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute bottom-5 left-6 z-10">
              <span className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg tracking-tight group-hover:tracking-wider transition-all duration-300">
                {backward.label}
              </span>
            </div>
          </span>
        )}

        {/* Forward Card */}
        {forward && (
          <span
            onClick={handleNavigation(forward.href)}
            className="group block rounded-lg overflow-hidden cursor-pointer relative aspect-[4/3] shadow-lg hover:brightness-125 transition-all duration-300"
            style={{ background: "#111" }}
          >
            <img
              src={forward.img}
              alt={forward.label}
              className="w-full h-full object-cover object-center group-hover:brightness-125 transition-all duration-500"
              draggable="false"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute bottom-5 right-6 z-10">
              <span className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg tracking-tight group-hover:tracking-wider transition-all duration-300">
                {forward.label}
              </span>
            </div>
          </span>
        )}
      </div>
    </div>
  );
};

export default ResearchSense;
