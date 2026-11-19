import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/layout/logo";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Login | NexStock",
  description: "Acesse sua conta NexStock e assuma o controle do seu estoque.",
};

export default function LoginPage() {
  return (
    <>
      <a className="skip-link" href="#login-email">Pular para o login</a>
      <main className={styles.screen}>
        <header className={styles.branding}>
          <Logo className={styles.logo} />
        </header>

        <aside className={styles.story} aria-labelledby="login-story-title">
          <h2 className={styles.storyTitle} id="login-story-title">Gerencie seu<br />Estoque</h2>
          <p className={styles.storyCopy}>Mais visão para sua operação.<br />Mais espaço para o seu negócio crescer.</p>
          <p className={styles.storySignature}>NexStock / Conecte-se ao próximo nível</p>
        </aside>

        <section className={styles.formPanel} aria-labelledby="login-title">
          <p className={styles.platformLabel}>Acesso à plataforma</p>
          <div className={styles.card}>
            <LoginForm />
          </div>
          <footer className={styles.copyright}>NexStock © 2026</footer>
        </section>
      </main>
    </>
  );
}
