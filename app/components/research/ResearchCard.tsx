"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";

interface ResearchCardProps {
  title: string;
  slug: string;
  preview: string;
  date: string;
  image: string;
  tags?: Array<{
    name: string;
    slug: {
      current: string;
    };
  }>;
}

const ANIMATION_CONFIG = {
  pageTransition: {
    duration: 2000,
    easing: "cubic-bezier(0.9, 0, 0.1, 1)",
  },
  menu: {
    duration: 0.5,
    stagger: 0.1,
  },
  hover: {
    duration: 0.3,
  },
} as const;

export default function ResearchCard({
  title,
  slug,
  preview,
  date,
  image,
  tags,
}: ResearchCardProps) {
  const router = useTransitionRouter();
  const pathname = usePathname();

  const triggerPageTransition = () => {
    document.documentElement.animate(
      [
        { clipPath: "polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)" },
        { clipPath: "polygon(0 100%, 100% 100%, 100% 0,0 0)" },
      ],
      {
        duration: ANIMATION_CONFIG.pageTransition.duration,
        easing: ANIMATION_CONFIG.pageTransition.easing,
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  const handleNavigation =
    (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (path === pathname) {
        e.preventDefault();
        return;
      }
      router.push(path, {
        onTransitionReady: triggerPageTransition,
      });
    };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) =>
        handleNavigation(`/research/${slug}`)(
          e as unknown as React.MouseEvent<HTMLAnchorElement>,
        )
      }
      className="cursor-pointer group relative"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden mb-4 rounded-lg">
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 z-10" />
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <h2 className="text-xl font-medium mb-2 group-hover:text-gray-600 transition-colors duration-300">
        {title}
      </h2>

      <div className="flex items-center text-sm text-gray-500">
        <p className="line-clamp-2 group-hover:text-gray-600 transition-colors duration-300">
          {preview}
        </p>
        <span className="mx-2">•</span>
        <time className="group-hover:text-gray-600 transition-colors duration-300">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <span
              key={tag.slug.current}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
