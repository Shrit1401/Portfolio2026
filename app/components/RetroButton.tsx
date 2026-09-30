import Link from "next/link";

/** Footer link to Shrit TV (/retro): a tiny glowing CRT that fuzzes into static on hover. */
export default function RetroButton() {
  return (
    <Link href="/retro" className="retro-chip press" aria-label="Shrit TV, a retro version of this site">
      <span className="retro-chip-screen">
        <span className="retro-chip-text">▶ SHRIT TV</span>
      </span>
      <span className="retro-chip-knobs" aria-hidden>
        <i />
        <i />
      </span>
    </Link>
  );
}
