import Link from "next/link";

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff2a8_0%,#ffb9a7_35%,#52d5c8_68%,#1f4fbf_100%)] px-4 py-6 text-slate-950">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-[2rem] border border-white/40 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur md:p-8">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-slate-900/70">
          friends
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-950">
          Entrar na sala
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-950/85">
          Aqui vamos receber o jogador para digitar o codigo da sala e entrar na
          partida com os amigos.
        </p>
        <Link
          className="inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-black uppercase tracking-[0.16em] text-white"
          href="/"
        >
          Voltar para home
        </Link>
      </section>
    </main>
  );
}
