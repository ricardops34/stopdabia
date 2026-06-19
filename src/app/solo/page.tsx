"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const LETTERS = "BCDFGHJLMNPRSTV".split("");

const CATEGORIES = [
  { id: "nome", label: "Nome", emoji: "👤" },
  { id: "animal", label: "Animal", emoji: "🐾" },
  { id: "objeto", label: "Objeto", emoji: "💡" },
  { id: "comida", label: "Comida", emoji: "🍔" },
  { id: "cidade", label: "Cidade / País", emoji: "🌎" },
  { id: "cor", label: "Cor", emoji: "🎨" },
];

const TOTAL_TIME = 120;

type Phase = "setup" | "countdown" | "playing" | "done";

export default function SoloPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [letter, setLetter] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [cdNum, setCdNum] = useState(3);

  const startGame = useCallback(() => {
    const l = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setLetter(l);
    setAnswers({});
    setTimeLeft(TOTAL_TIME);
    setCdNum(3);
    setPhase("countdown");
  }, []);

  useEffect(() => {
    if (phase !== "countdown") return;
    const id = setTimeout(() => {
      if (cdNum <= 0) setPhase("playing");
      else setCdNum((n) => n - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [phase, cdNum]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft === 0) { setPhase("done"); return; }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft]);

  const filled = Object.values(answers).filter((v) => v.trim()).length;
  const pct = (timeLeft / TOTAL_TIME) * 100;
  const timerColor =
    timeLeft > 60 ? "#4ade80" : timeLeft > 30 ? "#fbbf24" : "#f87171";

  /* ── SETUP ─────────────────────────────────────────────────────────── */
  if (phase === "setup") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#140028] px-4 py-10">
        <style>{`
          @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes glow    { 0%,100%{opacity:.7} 50%{opacity:1} }
        `}</style>

        <div className="flex w-full max-w-md items-center justify-between">
          <Link
            href="/"
            className="text-sm font-black uppercase tracking-widest text-white/40 transition hover:text-white/80"
          >
            ← Voltar
          </Link>
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.3em] text-purple-400">
            Solo
          </span>
        </div>

        <div className="text-center" style={{ animation: "floatUp 3s ease-in-out infinite" }}>
          <h1
            className="text-7xl font-black uppercase text-white"
            style={{ textShadow: "0 0 40px #ef7ba3, 0 0 80px #9651ef" }}
          >
            STOP
          </h1>
          <p className="mt-1 text-sm font-bold uppercase tracking-[0.35em] text-pink-400">
            treino solo
          </p>
        </div>

        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-sm font-bold uppercase tracking-wide text-white/80">
                {cat.label}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={startGame}
          className="w-full max-w-md rounded-full py-5 text-xl font-black uppercase tracking-widest text-white transition-transform active:scale-95"
          style={{
            background: "linear-gradient(135deg, #ef7ba3 0%, #9651ef 100%)",
            boxShadow:
              "0 0 40px rgba(150,81,239,.55), 0 4px 24px rgba(239,123,163,.4)",
          }}
        >
          ▶ COMEÇAR
        </button>
      </main>
    );
  }

  /* ── COUNTDOWN ──────────────────────────────────────────────────────── */
  if (phase === "countdown") {
    const label = cdNum <= 0 ? "VAI!" : String(cdNum);
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#140028]">
        <style>{`
          @keyframes popIn {
            0%   { transform: scale(1.6); opacity: 0; }
            60%  { transform: scale(.92); opacity: 1; }
            100% { transform: scale(1);   opacity: 1; }
          }
        `}</style>
        <div
          key={label}
          className="text-center"
          style={{ animation: "popIn .35s cubic-bezier(.22,1,.36,1) both" }}
        >
          <span
            className="text-[10rem] font-black leading-none text-white"
            style={{ textShadow: "0 0 60px #9651ef, 0 0 120px #9651ef" }}
          >
            {label}
          </span>
        </div>
      </main>
    );
  }

  /* ── PLAYING ────────────────────────────────────────────────────────── */
  if (phase === "playing") {
    return (
      <main className="flex min-h-screen flex-col bg-[#140028]">
        {/* timer bar */}
        <div className="h-1.5 w-full bg-white/10">
          <div
            className="h-full transition-all duration-1000 ease-linear"
            style={{
              width: `${pct}%`,
              background: timerColor,
              boxShadow: `0 0 12px ${timerColor}`,
            }}
          />
        </div>

        {/* header row */}
        <div className="flex items-center justify-between px-5 pt-4">
          <span
            className="text-2xl font-black tabular-nums transition-colors duration-500"
            style={{ color: timerColor }}
          >
            {timeLeft}s
          </span>

          <div className="flex flex-col items-center">
            <span className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-white/30">
              letra
            </span>
            <span
              className="text-6xl font-black leading-none text-white"
              style={{ textShadow: "0 0 30px #ef7ba3, 0 0 60px #9651ef" }}
            >
              {letter}
            </span>
          </div>

          <span className="text-sm font-bold text-white/30">
            {filled}/{CATEGORIES.length}
          </span>
        </div>

        {/* categories */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur focus-within:border-purple-500/60 focus-within:bg-purple-500/10"
              style={{ transition: "border-color .2s, background .2s" }}
            >
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="text-base">{cat.emoji}</span>
                <span className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-white/40">
                  {cat.label}
                </span>
              </div>
              <input
                type="text"
                inputMode="text"
                autoCapitalize="words"
                placeholder={`${letter}...`}
                value={answers[cat.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [cat.id]: e.target.value }))
                }
                className="w-full bg-transparent px-4 pb-3 text-lg font-bold text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* STOP button */}
        <div className="px-4 pb-8 pt-2">
          <button
            onClick={() => setPhase("done")}
            className="w-full rounded-full py-5 text-2xl font-black uppercase tracking-widest text-white transition-transform active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
              boxShadow: "0 0 32px rgba(239,68,68,.6), 0 4px 20px rgba(239,68,68,.3)",
              animation: "pulse 2s cubic-bezier(.4,0,.6,1) infinite",
            }}
          >
            ✋ STOP!
          </button>
        </div>

        <style>{`
          @keyframes pulse {
            0%,100% { box-shadow: 0 0 32px rgba(239,68,68,.6), 0 4px 20px rgba(239,68,68,.3); }
            50%      { box-shadow: 0 0 52px rgba(239,68,68,.9), 0 4px 30px rgba(239,68,68,.5); }
          }
        `}</style>
      </main>
    );
  }

  /* ── DONE ───────────────────────────────────────────────────────────── */
  const score = filled * 10;
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-[#140028] px-4 py-10">
      <div className="relative h-44 w-44">
        <Image
          src={filled > 0 ? "/aviso/vencedor.png" : "/aviso/perdeu.png"}
          alt={filled > 0 ? "Você venceu!" : "Que pena!"}
          fill
          className="object-contain"
        />
      </div>

      <div className="text-center">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.35em] text-white/40">
          pontuação
        </p>
        <p
          className="text-6xl font-black text-white"
          style={{ textShadow: "0 0 40px #fbbf24" }}
        >
          {score} pts
        </p>
        <p className="mt-1 text-sm text-white/50">
          {filled} de {CATEGORIES.length} respondidas · letra{" "}
          <span className="font-black text-pink-400">{letter}</span>
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-2">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <span className="text-base">{cat.emoji}</span>
            <span className="w-24 shrink-0 text-[0.65rem] font-black uppercase tracking-wide text-white/40">
              {cat.label}
            </span>
            <span
              className={`truncate text-sm font-bold ${answers[cat.id]?.trim() ? "text-white" : "text-white/20"}`}
            >
              {answers[cat.id]?.trim() || "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-md gap-3">
        <button
          onClick={startGame}
          className="flex-1 rounded-full py-4 font-black uppercase tracking-widest text-white transition-transform active:scale-95"
          style={{
            background: "linear-gradient(135deg, #ef7ba3 0%, #9651ef 100%)",
            boxShadow: "0 0 30px rgba(150,81,239,.4)",
          }}
        >
          Jogar de novo
        </button>
        <Link
          href="/"
          className="flex items-center justify-center rounded-full border border-white/20 px-6 py-4 font-black uppercase text-white/50 transition hover:text-white/80"
        >
          Início
        </Link>
      </div>
    </main>
  );
}
