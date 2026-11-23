
"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import Input from "@/components/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

import styles from "./login-form.module.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function LoginForm() {
  const router = useRouter();
  const recoveryId = useId();
  const submittingRef = useRef(false);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [recoveryVisible, setRecoveryVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    const senha = String(formData.get("password") ?? "");
    const lembrar = formData.get("remember") === "on";

    if (!email || !senha) {
      setFeedback("Preencha seu e-mail e senha.");
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setFeedback("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          senha,
          lembrar,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setFeedback(
          typeof data?.erro === "string"
            ? data.erro
            : "Não foi possível realizar o login."
        );
        return;
      }

      // O backend confirmou o login e salvou a sessão.
      // Agora o Next.js abre a página Home.
      router.replace("/home");
      router.refresh();
    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);

      setFeedback(
        "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <div className={styles.content}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>
          Bem-vindo de volta
        </p>

        <h1 className={styles.title} id="login-title">
          Login
        </h1>

        <p className={styles.description}>
          Acesse sua conta e assuma o controle.
        </p>
      </header>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
        onChange={() => setFeedback("")}
        aria-labelledby="login-title"
        aria-busy={loading}
      >
        <div className={styles.fields}>
          <Input
            id="login-email"
            name="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
          />

          <Input
            id="login-password"
            name="password"
            label="Senha"
            type={passwordVisible ? "text" : "password"}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
            trailing={
              <button
                className={`icon-button ${styles.passwordToggle}`}
                type="button"
                aria-label={
                  passwordVisible
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
                aria-pressed={passwordVisible}
                aria-controls="login-password"
                onClick={() =>
                  setPasswordVisible((visible) => !visible)
                }
              >
                <Icon
                  name={passwordVisible ? "eye-off" : "eye"}
                />
              </button>
            }
          />
        </div>

        <div className={styles.options}>
          <label className={styles.remember}>
            <input
              className={styles.checkbox}
              type="checkbox"
              name="remember"
            />

            <span>Lembrar de mim</span>
          </label>

          <button
            className={styles.forgot}
            type="button"
            aria-expanded={recoveryVisible}
            aria-controls={recoveryId}
            onClick={() =>
              setRecoveryVisible((visible) => !visible)
            }
          >
            Esqueceu a senha?
          </button>
        </div>

        {recoveryVisible && (
          <p
            className={styles.help}
            id={recoveryId}
            role="status"
          >
            Entre em contato com o administrador da sua loja
            para recuperar o acesso.
          </p>
        )}

        {feedback && (
          <p className={styles.feedback} role="alert">
            {feedback}
          </p>
        )}

        <Button
          type="submit"
          className={styles.submit}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}

          {!loading && (
            <Icon name="arrow-right" />
          )}
        </Button>
      </form>

      <p className={styles.caption}>
        Seu próximo grande passo começa aqui.
      </p>
    </div>
  );
}
