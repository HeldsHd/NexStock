"use client";

import { useState, type FormEvent } from "react";
import { InventoryProvider } from "@/components/home/inventory-provider";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/navigation";
import { useUserSettings } from "@/components/config/user-settings-provider";
import { defaultUserSettings } from "@/components/config/user-settings";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

function SettingsForm() {
  const { settings, updateSettings, saveSettings, loadError } = useUserSettings();
  const [feedback, setFeedback] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      saveSettings();
      setFeedback("Preferências salvas neste navegador.");
    } catch {
      setFeedback("Não foi possível salvar. Verifique as permissões de armazenamento do navegador.");
    }
  }

  function restoreDefaults() {
    updateSettings(defaultUserSettings);
    setFeedback("Padrões restaurados no formulário. Salve para aplicar.");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} onChange={() => setFeedback("")}>
      <div className={styles.grid}>
        <section className={`detail-card ${styles.card}`} aria-labelledby="profile-title">
          <div className={styles.cardHeading}>
            <span className={styles.cardIcon}><Icon name="user" /></span>
            <div>
              <h2 id="profile-title">Perfil do usuário</h2>
              <p>Personalize como suas informações aparecem neste navegador.</p>
            </div>
          </div>
          <label className={styles.field}>
            <span>Nome de exibição</span>
            <input
              type="text"
              name="displayName"
              autoComplete="name"
              maxLength={60}
              placeholder="Seu nome"
              value={settings.displayName}
              onChange={(event) => updateSettings({ ...settings, displayName: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span>E-mail</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              value={settings.email}
              onChange={(event) => updateSettings({ ...settings, email: event.target.value })}
            />
          </label>
          <p className={styles.note}>Esses dados são preferências locais e não alteram sua conta de acesso.</p>
        </section>

        <section className={`detail-card ${styles.card} ${styles.appearanceCard}`} aria-labelledby="appearance-title">
          <div className={styles.cardHeading}>
            <span className={styles.cardIcon}><Icon name="sun" /></span>
            <div>
              <h2 id="appearance-title">Aparência do site</h2>
              <p>Escolha o tema e a cor de destaque do NexStock.</p>
            </div>
          </div>

          <fieldset className={styles.fieldset}>
            <legend>Tema</legend>
            <div className={styles.themeOptions}>
              {([
                { value: "light", label: "Claro", icon: "sun" },
                { value: "dark", label: "Escuro", icon: "moon" },
                { value: "system", label: "Sistema", icon: "monitor" },
              ] as const).map(({ value, label, icon }) => (
                <label key={value} className={styles.themeOption} data-selected={settings.theme === value}>
                  <input
                    type="radio"
                    name="theme"
                    value={value}
                    checked={settings.theme === value}
                    onChange={() => updateSettings({ ...settings, theme: value })}
                  />
                  <Icon name={icon} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>Cor de destaque</legend>
            <div className={styles.accentOptions}>
              {([
                { value: "orange", label: "Laranja" },
                { value: "blue", label: "Azul" },
                { value: "violet", label: "Violeta" },
              ] as const).map(({ value, label }) => (
                <label key={value} className={styles.accentOption} data-accent={value} data-selected={settings.accent === value}>
                  <input
                    type="radio"
                    name="accent"
                    value={value}
                    checked={settings.accent === value}
                    onChange={() => updateSettings({ ...settings, accent: value })}
                  />
                  <span className={styles.swatch} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className={`detail-card ${styles.card} ${styles.accessibilityCard}`} aria-labelledby="accessibility-title">
          <div className={styles.cardHeading}>
            <span className={styles.cardIcon}><Icon name="settings" /></span>
            <div>
              <h2 id="accessibility-title">Acessibilidade</h2>
              <p>Ajuste o movimento da interface às suas preferências.</p>
            </div>
          </div>
          <label className={styles.toggleRow}>
            <span>
              <strong>Reduzir animações</strong>
              <small>Desativa transições e movimentos não essenciais no site.</small>
            </span>
            <input
              type="checkbox"
              name="reduceMotion"
              checked={settings.reduceMotion}
              onChange={(event) => updateSettings({ ...settings, reduceMotion: event.target.checked })}
            />
          </label>
        </section>
      </div>

      <footer className={styles.actions}>
        <p className={styles.feedback} role="status" aria-live="polite">
          {feedback || loadError || "As preferências ficam salvas somente neste navegador."}
        </p>
        <div className={styles.buttons}>
          <Button variant="secondary" type="button" onClick={restoreDefaults}>Restaurar padrões</Button>
          <Button type="submit"><Icon name="check" />Salvar alterações</Button>
        </div>
      </footer>
    </form>
  );
}

export default function SystemConfigPage() {
  return (
    <InventoryProvider>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div className="app-shell">
        <Header />
        <Navigation />
        <main id="conteudo" className="app-main" tabIndex={-1}>
          <div className="dashboard-content">
            <header className="page-heading">
              <div>
                <h1>Configurações</h1>
                <p>Gerencie seu perfil e a aparência do NexStock.</p>
              </div>
            </header>
            <SettingsForm />
          </div>
        </main>
      </div>
    </InventoryProvider>
  );
}
