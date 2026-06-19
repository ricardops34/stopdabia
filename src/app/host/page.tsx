"use client";

import { useState } from "react";
import Link from "next/link";

const ALL_CATEGORIES = [
  { id: "nome",   label: "Nome",        emoji: "👤" },
  { id: "animal", label: "Animal",      emoji: "🐾" },
  { id: "objeto", label: "Objeto",      emoji: "💡" },
  { id: "comida", label: "Comida",      emoji: "🍔" },
  { id: "cidade", label: "Cidade/País", emoji: "🌎" },
  { id: "cor",    label: "Cor",         emoji: "🎨" },
  { id: "fruta",  label: "Fruta",       emoji: "🍓" },
  { id: "esporte",label: "Esporte",     emoji: "⚽" },
];

const DEFAULT_ON = new Set(["nome", "animal", "objeto", "comida", "cidade", "cor"]);

export default function HostPage() {
  const [name, setName]         = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(DEFAULT_ON));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const canStart = name.trim().length >= 2 && selected.size >= 3;

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
        <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.3em] text-yellow-400">
          Host
        </span>
      </div>

      {/* title */}
      <div className="text-center" style={{ animation: "fadeUp .5s ease both" }}>
        <h1
          className="text-5xl font-black uppercase text-white"
          style={{ textShadow: "0 0 40px #f8bf21, 0 0 80px #f8bf21" }}
        >
          Criar sala
        </h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-[0.3em] text-yellow-400/70">
          configure e convide os amigos
        </p>
      </div>

      {/* nome do jogador */}
      <div className="w-full max-w-md" style={{ animation: "fadeUp .5s .1s ease both" }}>
        <label className="mb-2 block text-[0.6rem] font-black uppercase tracking-[0.3em] text-white/40">
          Seu apelido
        </label>
        <input
          type="text"
          maxLength={20}
          placeholder="Como quer ser chamado?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-lg font-bold text-white placeholder:text-white/20 focus:border-yellow-400/50 focus:bg-yellow-400/5 focus:outline-none transition"
        />
      </div>

      {/* categorias */}
      <div className="w-full max-w-md" style={{ animation: "fadeUp .5s .2s ease both" }}>
        <label className="mb-2 block text-[0.6rem] font-black uppercase tracking-[0.3em] text-white/40">
          Categorias ({selected.size} selecionadas · mín. 3)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_CATEGORIES.map((cat) => {
            const on = selected.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-left font-bold uppercase tracking-wide transition-all active:scale-95"
                style={{
                  borderColor: on ? "#f8bf21" : "rgba(255,255,255,0.08)",
                  background:  on ? "rgba(248,191,33,0.12)" : "rgba(255,255,255,0.04)",
                  color:       on ? "#f8bf21" : "rgba(255,255,255,0.45)",
                  fontSize: "0.78rem",
                  boxShadow: on ? "0 0 12px rgba(248,191,33,.25)" : "none",
                }}
              >
                <span className="text-xl">{cat.emoji}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* botão */}
      <div className="w-full max-w-md" style={{ animation: "fadeUp .5s .3s ease both" }}>
        <button
          disabled={!canStart}
          className="w-full rounded-full py-5 text-xl font-black uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: canStart
              ? "linear-gradient(135deg, #f8bf21 0%, #f97316 100%)"
              : "rgba(255,255,255,0.1)",
            boxShadow: canStart
              ? "0 0 40px rgba(248,191,33,.5), 0 5px 0 #92400e"
              : "none",
          }}
        >
          ▶ Criar sala
        </button>
        {!canStart && (
          <p className="mt-2 text-center text-xs text-white/30">
            {name.trim().length < 2 ? "Digite seu apelido" : "Selecione ao menos 3 categorias"}
          </p>
        )}
      </div>
    </main>
  );
}
