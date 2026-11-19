"use client";

import { useId, useState, type FormEvent } from "react";
import Input from "@/components/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import styles from "./login-form.module.css";

export function LoginForm() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [recoveryVisible, setRecoveryVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const recoveryId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // A API atual ainda não possui uma rota de autenticação.
    setFeedback("O acesso à plataforma ainda não está disponível. Tente novamente mais tarde.");
  }

  return (
    <div className={styles.content}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Bem-vindo de volta</p>
        <h1 className={styles.title} id="login-title">Login</h1>
        <p className={styles.description}>Acesse sua conta e assuma o controle.</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} onChange={() => setFeedback("")} aria-labelledby="login-title">
        <div className={styles.fields}>
          <Input id="login-email" name="email" label="E-mail" type="email" placeholder="seu@email.com" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
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
                aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={passwordVisible}
                aria-controls="login-password"
                onClick={() => setPasswordVisible((visible) => !visible)}
              >
                <Icon name={passwordVisible ? "eye-off" : "eye"} />
              </button>
            }
          />
        </div>

        <div className={styles.options}>
          <label className={styles.remember}>
            <input className={styles.checkbox} type="checkbox" name="remember" />
            <span>Lembrar de mim</span>
          </label>
          <button className={styles.forgot} type="button" aria-expanded={recoveryVisible} aria-controls={recoveryId} onClick={() => setRecoveryVisible((visible) => !visible)}>
            Esqueceu a senha?
          </button>
        </div>

        {recoveryVisible && <p className={styles.help} id={recoveryId} role="status">Entre em contato com o administrador da sua loja para recuperar o acesso.</p>}
        {feedback && <p className={styles.feedback} role="alert">{feedback}</p>}

        <Button type="submit" className={styles.submit}>
          Entrar
          <Icon name="arrow-right" />
        </Button>
      </form>

      <p className={styles.caption}>Seu próximo grande passo começa aqui.</p>
    </div>
  );
}
