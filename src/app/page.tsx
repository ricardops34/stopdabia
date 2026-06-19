import Image from "next/image";
import Link from "next/link";

const BG_CHARS = [
  { char: "A", x: "1%",  y: "4%",  size: "5.5rem", rot: "-18deg", op: 0.13 },
  { char: "B", x: "6%",  y: "28%", size: "7rem",   rot: "22deg",  op: 0.10 },
  { char: "C", x: "2%",  y: "55%", size: "4.5rem", rot: "-9deg",  op: 0.14 },
  { char: "D", x: "9%",  y: "78%", size: "6.5rem", rot: "14deg",  op: 0.09 },
  { char: "E", x: "14%", y: "12%", size: "4rem",   rot: "8deg",   op: 0.08 },
  { char: "F", x: "18%", y: "88%", size: "5rem",   rot: "-25deg", op: 0.10 },
  { char: "★", x: "4%",  y: "42%", size: "3rem",   rot: "10deg",  op: 0.15 },
  { char: "♥", x: "12%", y: "62%", size: "2.5rem", rot: "-5deg",  op: 0.12 },
  { char: "G", x: "78%", y: "5%",  size: "6rem",   rot: "20deg",  op: 0.10 },
  { char: "H", x: "85%", y: "30%", size: "7.5rem", rot: "-15deg", op: 0.09 },
  { char: "I", x: "90%", y: "58%", size: "4rem",   rot: "28deg",  op: 0.13 },
  { char: "J", x: "80%", y: "80%", size: "5.5rem", rot: "-10deg", op: 0.10 },
  { char: "K", x: "73%", y: "15%", size: "3.5rem", rot: "-22deg", op: 0.08 },
  { char: "L", x: "88%", y: "72%", size: "4.5rem", rot: "12deg",  op: 0.11 },
  { char: "★", x: "92%", y: "44%", size: "3rem",   rot: "-8deg",  op: 0.15 },
  { char: "♥", x: "76%", y: "92%", size: "2.5rem", rot: "15deg",  op: 0.12 },
  { char: "M", x: "48%", y: "2%",  size: "4rem",   rot: "-12deg", op: 0.07 },
  { char: "N", x: "52%", y: "96%", size: "5rem",   rot: "18deg",  op: 0.08 },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#ef7ba3]">
      {/* radial glow that frames the image */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 50%, #f4a0c0 0%, #e85f99 55%, #c73d7e 100%)",
        }}
      />

      {/* scattered alphabet – decorates the side areas on desktop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
        {BG_CHARS.map(({ char, x, y, size, rot, op }, i) => (
          <span
            key={i}
            className="absolute font-black text-white"
            style={{
              left: x,
              top: y,
              fontSize: size,
              transform: `rotate(${rot})`,
              opacity: op,
              lineHeight: 1,
              fontFamily: "var(--font-geist-sans)",
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* skip link */}
      <a
        className="absolute left-3 top-3 z-30 -translate-y-24 rounded-full bg-slate-950 px-4 py-3 text-sm font-bold text-white transition focus:translate-y-0 focus:outline-none focus:ring-4 focus:ring-white/80"
        href="#modos"
      >
        Pular para os modos de jogo
      </a>

      <header className="sr-only">
        <h1>Bia STOP</h1>
      </header>

      {/* game image – square sized to fit the viewport */}
      <section
        aria-label="Tela inicial do Bia STOP"
        className="relative z-10"
        style={{ width: "min(100vw, 100svh)", height: "min(100vw, 100svh)" }}
      >
        <Image
          alt="Arte principal do Bia STOP"
          fill
          priority
          sizes="min(100vw, 100svh)"
          src="/inicio.png"
        />

        <nav
          aria-label="Modos de jogo"
          className="absolute inset-0"
          id="modos"
        >
          <Link
            href="/solo"
            className="absolute rounded-full focus:outline-none focus:ring-4 focus:ring-cyan-200/80"
            style={{ left: "4.2%", top: "89.2%", width: "28.6%", height: "6.7%" }}
          >
            <span className="sr-only">Jogar sozinho</span>
          </Link>
          <Link
            href="/host"
            className="absolute rounded-full focus:outline-none focus:ring-4 focus:ring-yellow-200/80"
            style={{ left: "35.2%", top: "89.2%", width: "29.4%", height: "6.7%" }}
          >
            <span className="sr-only">Jogar</span>
          </Link>
          <Link
            href="/join"
            className="absolute rounded-full focus:outline-none focus:ring-4 focus:ring-violet-200/80"
            style={{ left: "67.2%", top: "89.2%", width: "28.8%", height: "6.7%" }}
          >
            <span className="sr-only">Jogar com amigos</span>
          </Link>
        </nav>
      </section>
    </main>
  );
}
