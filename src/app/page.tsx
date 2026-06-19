import Image from "next/image";
import Link from "next/link";

type CardProps = {
  label: string;
  color: string;
  content: string;
  rotate?: string;
};

function CategoryCard({ label, color, content, rotate = "0deg" }: CardProps) {
  return (
    <div
      aria-hidden
      className="flex flex-col overflow-hidden rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.22)]"
      style={{
        width: 80,
        minHeight: 96,
        transform: `rotate(${rotate})`,
        background: "#fff8ee",
      }}
    >
      <div
        className="py-1.5 text-center text-[0.55rem] font-black uppercase tracking-wider text-white"
        style={{ background: color }}
      >
        {label}
      </div>
      <div
        className="flex flex-1 items-center justify-center text-[2rem] font-black leading-none py-2"
        style={{ color }}
      >
        {content}
      </div>
    </div>
  );
}

const BG = [
  { char: "A", x: "1%",  y: "4%",  s: "5.5rem", r: "-18deg", o: 0.14 },
  { char: "B", x: "4%",  y: "30%", s: "7rem",   r: "20deg",  o: 0.11 },
  { char: "C", x: "0%",  y: "58%", s: "4.5rem", r: "-9deg",  o: 0.13 },
  { char: "D", x: "7%",  y: "80%", s: "6.5rem", r: "14deg",  o: 0.10 },
  { char: "★", x: "3%",  y: "45%", s: "2.5rem", r: "10deg",  o: 0.20 },
  { char: "E", x: "83%", y: "6%",  s: "6rem",   r: "-20deg", o: 0.12 },
  { char: "F", x: "88%", y: "34%", s: "7.5rem", r: "16deg",  o: 0.10 },
  { char: "G", x: "91%", y: "61%", s: "4rem",   r: "-12deg", o: 0.13 },
  { char: "H", x: "80%", y: "82%", s: "5.5rem", r: "22deg",  o: 0.11 },
  { char: "♥", x: "93%", y: "46%", s: "2.5rem", r: "-6deg",  o: 0.18 },
  { char: "I", x: "44%", y: "1%",  s: "4rem",   r: "-15deg", o: 0.09 },
  { char: "★", x: "19%", y: "91%", s: "2rem",   r: "-10deg", o: 0.17 },
  { char: "♥", x: "73%", y: "93%", s: "2rem",   r: "12deg",  o: 0.15 },
  { char: "J", x: "51%", y: "95%", s: "5rem",   r: "18deg",  o: 0.09 },
];

export default function Home() {
  return (
    <main className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-[#ef7ba3] px-3 py-4">

      {/* ── background ──────────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 85% at 50% 44%, #f7b8cf 0%, #eb6ca6 55%, #c8367e 100%)",
          }}
        />
        {BG.map(({ char, x, y, s, r, o }, i) => (
          <span
            key={i}
            className="absolute font-black text-white"
            style={{ left: x, top: y, fontSize: s, transform: `rotate(${r})`, opacity: o, lineHeight: 1 }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* ── skip + hidden h1 ────────────────────────────────────────── */}
      <a
        className="absolute left-3 top-3 z-30 -translate-y-24 rounded-full bg-slate-950 px-4 py-3 text-sm font-bold text-white transition focus:translate-y-0 focus:outline-none focus:ring-4 focus:ring-white/80"
        href="#modos"
      >
        Pular para os modos de jogo
      </a>
      <header className="sr-only">
        <h1>Bia STOP</h1>
      </header>

      {/* ── content block ───────────────────────────────────────────── */}
      <section
        aria-label="Tela inicial do Bia STOP"
        className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4"
      >
        {/* hero row */}
        <div className="flex w-full items-center justify-between">

          {/* left cards */}
          <div className="flex flex-col gap-2.5">
            <CategoryCard label="Letra"  color="#3b82f6" content="B"  rotate="-5deg" />
            <CategoryCard label="Nome"   color="#ec4899" content="B"  rotate="3deg"  />
            <CategoryCard label="Animal" color="#8b5cf6" content="🐾" rotate="-3deg" />
          </div>

          {/* mascot + title */}
          <div className="flex flex-col items-center gap-1">
            {/* circular frame */}
            <div
              className="relative overflow-hidden rounded-full"
              style={{
                width: 172,
                height: 172,
                background: "#0fc8d8",
                border: "5px solid #f8bf21",
                boxShadow: "0 0 0 3px #cf7d00, 0 8px 32px rgba(0,0,0,0.28)",
              }}
            >
              <Image
                alt="Arte principal do Bia STOP"
                src="/cachorra.png"
                fill
                sizes="172px"
                priority
                className="object-cover object-top scale-110"
              />
            </div>

            {/* game title */}
            <div className="text-center leading-none">
              <div
                className="text-[2.8rem] font-black uppercase text-white"
                style={{
                  WebkitTextStroke: "3px #5b21b6",
                  paintOrder: "stroke fill",
                  textShadow: "0 4px 0 rgba(91,33,182,.4)",
                }}
              >
                STOP
              </div>
              <div className="flex items-baseline justify-center gap-1.5 -mt-2">
                <span
                  className="text-[1.3rem] font-black italic text-white"
                  style={{ WebkitTextStroke: "2px #5b21b6", paintOrder: "stroke fill" }}
                >
                  da
                </span>
                <span
                  className="text-[2rem] font-black text-[#ff6eb4]"
                  style={{ WebkitTextStroke: "2.5px #5b21b6", paintOrder: "stroke fill" }}
                >
                  BiA
                </span>
              </div>
            </div>
          </div>

          {/* right cards */}
          <div className="flex flex-col gap-2.5">
            <CategoryCard label="Comida" color="#22c55e" content="🍔" rotate="4deg"  />
            <CategoryCard label="Objeto" color="#f97316" content="💡" rotate="-3deg" />
            <CategoryCard label="País"   color="#0ea5e9" content="🌎" rotate="3deg"  />
          </div>
        </div>

        {/* subtitle banner */}
        <div
          className="w-full rounded-full px-4 py-2.5 text-center text-[0.65rem] font-black uppercase tracking-[0.18em]"
          style={{
            background: "linear-gradient(135deg, #fde68a, #fbbf24, #f59e0b)",
            color: "#78350f",
            boxShadow: "0 5px 0 #92400e, 0 6px 20px rgba(146,64,14,.28)",
          }}
        >
          ❤️ O jogo de STOP mais divertido! ❤️
        </div>

        {/* buttons */}
        <nav aria-label="Modos de jogo" id="modos" className="flex w-full gap-2">
          <Link
            href="/solo"
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-4 font-black uppercase text-white transition-transform active:scale-95"
            style={{
              background: "#15a8c4",
              boxShadow: "0 5px 0 #0d7e8a, 0 6px 20px rgba(21,168,196,.35)",
              fontSize: "clamp(10px,2.4vw,13px)",
              letterSpacing: "0.04em",
            }}
          >
            <span className="text-xl" aria-hidden>👤</span>
            <span className="text-center leading-tight">Jogar sozinho</span>
          </Link>

          <Link
            href="/host"
            className="flex flex-[1.35] items-center justify-center gap-2 rounded-full py-4 font-black uppercase transition-transform active:scale-95"
            style={{
              background: "#f8bf21",
              color: "#1c0a00",
              boxShadow: "0 5px 0 #cf7d00, 0 6px 20px rgba(248,191,33,.40)",
              fontSize: "clamp(15px,3.2vw,20px)",
              letterSpacing: "0.06em",
            }}
          >
            <span aria-hidden className="text-2xl">▶</span>
            <span>Jogar</span>
          </Link>

          <Link
            href="/join"
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-4 font-black uppercase text-white transition-transform active:scale-95"
            style={{
              background: "#9651ef",
              boxShadow: "0 5px 0 #6a2db0, 0 6px 20px rgba(150,81,239,.35)",
              fontSize: "clamp(10px,2.4vw,13px)",
              letterSpacing: "0.04em",
            }}
          >
            <span className="text-xl" aria-hidden>👥</span>
            <span className="text-center leading-tight">Jogar com amigos</span>
          </Link>
        </nav>
      </section>
    </main>
  );
}
