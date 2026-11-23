
"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Package,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState("");

  function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!email.trim() || !senha) {
      setErro("Preencha seu e-mail e senha.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErro("Digite um e-mail válido.");
      return;
    }

    // Integre aqui sua autenticação real.
    // Não autentique apenas verificando os campos no frontend.
    console.log("Formulário validado", { email, lembrar });
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#03050d] px-4 py-8 text-white sm:px-8">
      {/* Fundo com pequenos pontos luminosos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(#8b9acb 0.65px, transparent 0.65px)",
          backgroundSize: "91px 87px",
        }}
      />

      <div className="relative z-10 flex w-full max-w-[1200px] flex-col overflow-hidden rounded-2xl border border-[#303a57]/70 bg-[#101729] shadow-[0_35px_100px_rgba(0,0,0,0.45)] md:min-h-[650px] md:flex-row">
        {/* PAINEL ESQUERDO - DESKTOP */}
        <section className="relative hidden min-h-[650px] flex-1 flex-col justify-between overflow-hidden bg-[#080d1c] p-12 md:flex lg:p-14">
          <div
            className="pointer-events-none absolute -left-[45%] -top-[35%] h-[125%] w-[135%] rounded-full"
            style={{
              background:
                "radial-gradient(circle at center, #252047 0%, #15172f 45%, #0b1021 70%, transparent 75%)",
            }}
          />

          <div className="relative z-10 flex items-center gap-1.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-[#ff6417] text-[#10121a]">
              <Package size={19} strokeWidth={3} />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              NexStock
            </span>
          </div>

          <div className="relative z-10 max-w-[420px]">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#a69ce6]">
              Controle inteligente
            </p>

            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight lg:text-5xl">
              Gerencie seu
              <br />
              Estoque
            </h1>

            <div className="mt-7 h-1 w-14 rounded-full bg-[#ff6417]" />
          </div>

          <div className="relative z-10">
            <p className="text-sm leading-7 text-[#a5acc3]">
              Mais visão para sua operação.
              <br />
              Mais espaço para o seu negócio crescer.
            </p>

            <p className="mt-9 text-[10px] uppercase tracking-[0.22em] text-[#737d9a]">
              NexStock / Conecte-se ao próximo nível
            </p>
          </div>
        </section>

        {/* PAINEL DIREITO - LOGIN */}
        <section className="relative flex w-full flex-col bg-[radial-gradient(ellipse_at_65%_15%,#202a4c_0%,#141c32_48%,#0b101d_100%)] px-6 py-8 sm:px-12 md:w-[46%] md:px-10 md:py-12 lg:px-16">
          {/* Logo no celular */}
          <div className="mb-16 flex items-center gap-1.5 md:hidden">
            <div className="flex size-8 items-center justify-center rounded-md bg-[#ff6417] text-[#10121a]">
              <Package size={19} strokeWidth={3} />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              NexStock
            </span>
          </div>

          <div className="hidden text-[10px] uppercase tracking-[0.28em] text-[#929bb6] md:block">
            Acesso à plataforma
          </div>

          <div className="flex flex-1 flex-col justify-center py-5 md:py-12">
            <div className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b8aafa]">
                Bem-vindo de volta
              </p>

              <h2 className="text-3xl font-semibold tracking-tight">
                Login
              </h2>

              <p className="mt-2 text-sm text-[#929bb1]">
                Acesse sua conta e assuma o controle.
              </p>
            </div>

            <form onSubmit={entrar} className="space-y-5">
              {/* E-MAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium text-[#e6e9f5]"
                >
                  E-mail
                </label>

                <div className="group relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#69748d] transition-colors group-focus-within:text-[#ff6417]"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="h-12 w-full rounded-lg border border-[#303b55] bg-[#0b1120]/90 pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-[#69748d] hover:border-[#4b5875] focus:border-[#ff6417] focus:ring-2 focus:ring-[#ff6417]/15"
                  />
                </div>
              </div>

              {/* SENHA */}
              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-xs font-medium text-[#e6e9f5]"
                >
                  Senha
                </label>

                <div className="group relative">
                  <LockKeyhole
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#69748d] transition-colors group-focus-within:text-[#ff6417]"
                  />

                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    className="h-12 w-full rounded-lg border border-[#303b55] bg-[#0b1120]/90 pl-11 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-[#69748d] hover:border-[#4b5875] focus:border-[#ff6417] focus:ring-2 focus:ring-[#ff6417]/15"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
                    aria-pressed={mostrarSenha}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c879f] transition-colors hover:text-white"
                  >
                    {mostrarSenha ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* OPÇÕES */}
              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#8f9ab1]">
                  <input
                    type="checkbox"
                    checked={lembrar}
                    onChange={(e) => setLembrar(e.target.checked)}
                    className="size-4 cursor-pointer accent-[#ff6417]"
                  />
                  Lembrar de mim
                </label>

                <a
                  href="/recuperar-senha"
                  className="text-xs font-medium text-[#c2b7ff] transition-colors hover:text-white hover:underline"
                >
                  Esqueceu a senha?
                </a>
              </div>

              {erro && (
                <p role="alert" className="text-xs text-red-400">
                  {erro}
                </p>
              )}

              {/* ENTRAR */}
              <button
                type="submit"
                className="group flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#ff6417] text-sm font-bold text-[#11131b] shadow-[0_8px_25px_rgba(255,100,23,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ff792f] hover:shadow-[0_12px_30px_rgba(255,100,23,0.25)] active:translate-y-0 active:scale-[0.99]"
              >
                Entrar
                <ArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>
            </form>

            <p className="mt-7 text-center text-xs text-[#79849e]">
              Seu próximo grande passo começa aqui.
            </p>
          </div>

          <p className="pt-10 text-center text-[11px] text-[#6d7892] md:text-left">
            © NexStock 2026
          </p>
        </section>
      </div>
    </main>
  );
}
