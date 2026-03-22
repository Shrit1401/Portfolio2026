import Link from "next/link";

interface TagProps {
  name: string;
  slug: string;
}

export default function Tag({ name, slug }: TagProps) {
  return (
    <Link
      href={`/resarch/tag/${slug}`}
      className="inline-block px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors duration-200"
    >
      {name}
    </Link>
  );
}
