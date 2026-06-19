"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const CODE_LENGTH = 6;

export default function JoinPage() {
  const [name, setName]   = useState("");
  const [code, setCode]   = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs         = useRef<(HTMLInputElement | null)[]>([]);

  function handleCodeKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    const val = e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!val && e.key === "Backspace" && i > 0) {
      const next = [...code];
      next[i] = "";
      setCode(next);
      inputRefs.current[i - 1]?.focus();
      return;
    }
    if (!val) return;
    const next = [...code];
    next[i] = val[0];
    setCode(next);
    if (i < CODE_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  }

  function handleCodeChange(i: number, val: string) {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean) return;
    const next = [...code];
    next[i] = clean[0];
    setCode(next);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setCode(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
    e.preventDefault();
  }

  const fullCode = code.join("");
  const canJoin  = name.trim().length >= 2 && fullCode.length === CODE_LENGTH;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#140028] px-4 py-8 gap-6">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* header */}
      <div className="flex w-full max-w-md items-center justify-between">
        <Link
          href="/"
          className="text-sm font-black uppercase tracking-widest text-white/40 transition hover:text-white/80"
        >
          ← Voltar
        </Link>
        <span className="rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.3em] text-purple-400">
          Amigos
        </span>
      </div>

      {/* title */}
      <div className="text-center" style={{ animation: "fadeUp .5s ease both" }}>
        <h1
          className="text-5xl font-black uppercase text-white"
          style={{ textShadow: "0 0 40px #9651ef, 0 0 80px #9651ef" }}
        >
          Entrar
        </h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-[0.3em] text-purple-400/70">
          use o código da sala
        </p>
      </div>

      {/* código da sala */}
      <div className="w-full max-w-md" style={{ animation: "fadeUp .5s .1s ease both" }}>
        <label className="mb-3 block text-[0.6rem] font-black uppercase tracking-[0.3em] text-white/40">
          Código da sala
        </label>
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {code.map((char, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={char}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleCodeKey(i, e)}
              className="h-16 w-12 rounded-2xl border text-center text-2xl font-black uppercase text-white focus:outline-none transition-all"
              style={{
                background: char ? "rgba(150,81,239,0.15)" : "rgba(255,255,255,0.05)",
                borderColor: char ? "#9651ef" : "rgba(255,255,255,0.12)",
                boxShadow: char ? "0 0 14px rgba(150,81,239,.35)" : "none",
                caretColor: "transparent",
              }}
            />
          ))}
        </div>
      </div>

      {/* apelido */}
      <div className="w-full max-w-md" style={{ animation: "fadeUp .5s .2s ease both" }}>
        <label className="mb-2 block text-[0.6rem] font-black uppercase tracking-[0.3em] text-white/40">
          Seu apelido
        </label>
        <input
          type="text"
          maxLength={20}
          placeholder="Como quer ser chamado?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-lg font-bold text-white placeholder:text-white/20 focus:border-purple-400/50 focus:bg-purple-400/5 focus:outline-none transition"
        />
      </div>

      {/* botão */}
      <div className="w-full max-w-md" style={{ animation: "fadeUp .5s .3s ease both" }}>
        <button
          disabled={!canJoin}
          className="w-full rounded-full py-5 text-xl font-black uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: canJoin
              ? "linear-gradient(135deg, #9651ef 0%, #15a8c4 100%)"
              : "rgba(255,255,255,0.1)",
            boxShadow: canJoin
              ? "0 0 40px rgba(150,81,239,.5), 0 5px 0 #4c1d95"
              : "none",
          }}
        >
          Entrar na sala →
        </button>
        {!canJoin && (
          <p className="mt-2 text-center text-xs text-white/30">
            {fullCode.length < CODE_LENGTH ? "Digite o código completo" : "Digite seu apelido"}
          </p>
        )}
      </div>
    </main>
  );
}
