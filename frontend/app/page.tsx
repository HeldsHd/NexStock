"use client";

import { FormEvent, useState } from "react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Informe um e-mail válido.");
      return;
    }

    if (password.length < 6) {
      setMessage("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setMessage("");
    setLoading(true);
    window.setTimeout(() => setLoading(false), 900);
  }

  return (
    <main className="min-h-screen p-4 flex">
      <div className="flex-1 grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-[#1f2742]">
        <section className="relative hidden lg:flex flex-col justify-between p-16 overflow-hidden bg-[radial-gradient(circle_at_25%_60%,#241d5c_0%,#12123a_35%,#080a18_70%)]">
          <div className="absolute left-[-110%] top-1/2 -translate-y-1/2 w-[200%] aspect-square rounded-full bg-[#151637] pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none" />
          <p className="relative text-xs text-[#8d96ba] m-0">NexStock</p>
        </section>

        <section className="relative flex flex-col px-6 py-10 sm:px-16 lg:border-l border-[#2a3358] bg-[linear-gradient(135deg,#0d1226_0%,#161d3d_55%,#1c2750_100%)]">
          <p className="text-[10px] tracking-widest uppercase text-[#7a84ab] m-0">
            Acesso à plataforma
          </p>

          <div className="relative flex-1 flex items-center justify-center">
            <form className="w-full max-w-sm" noValidate onSubmit={handleSubmit}>
              <p className="text-sm font-semibold tracking-widest uppercase text-[#a99cf5] m-0">
                Bem-vindo de volta
              </p>
              <h1 className="text-4xl font-semibold text-white mt-1 mb-2">Login</h1>
              <p className="text-sm text-[#8d96ba] mt-0 mb-8">
                Acesse sua conta e assuma o controle.
              </p>

              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full h-12 rounded-xl bg-[#0b101f] border-2 border-[#2a3358] px-4 text-sm text-white placeholder-[#6f7699] mb-5 box-border outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#fb6a1c]"
              />

              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Senha
              </label>
              <div className="relative mb-4">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  className="w-full h-12 rounded-xl bg-[#0b101f] border-2 border-[#2a3358] pl-4 pr-12 text-sm text-white placeholder-[#6f7699] box-border outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#fb6a1c]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-transparent border-0 text-[#8d96ba] cursor-pointer text-lg"
                >
                  <span aria-hidden="true">👁</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs mb-6">
                <label className="flex items-center gap-2 text-[#8d96ba] cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-[#fb6a1c]" />
                  Lembrar de mim
                </label>
                <a href="#esqueci" className="text-[#b4a9ff] no-underline hover:underline">
                  Esqueceu a senha?
                </a>
              </div>

              <p role="alert" className="text-sm text-[#ff7b72] min-h-5 m-0 mb-2">
                {message}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl border-0 bg-[#fb6a1c] hover:bg-[#ff7a30] disabled:opacity-70 text-[#1a0d03] font-bold text-sm cursor-pointer outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#fb6a1c]"
              >
                {loading ? "Entrando…" : "Entrar →"}
              </button>

              <p className="text-center text-xs text-[#8d96ba] mt-8 mb-0">
                Seu próximo grande passo começa aqui.
              </p>
            </form>
          </div>

          <p className="relative text-xs text-[#6f7699] m-0">NexStock © 2026</p>
        </section>
      </div>
    </main>
  );
}
