"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { createCategory, listCategories } from "@/lib/categories";
import styles from "./categories.module.css";

export function CategoriesSettings() {
  const [categories, setCategories] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const result = await listCategories(controller.signal);
        if (!controller.signal.aborted) {
          setCategories(result);
          setLoadError("");
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setLoadError(cause instanceof Error ? cause.message : "Não foi possível carregar as categorias.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [revision]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const categoryName = name.trim();
    setError("");
    setFeedback("");

    if (!categoryName) {
      setError("Informe o nome da categoria.");
      return;
    }
    if (categories.some((category) => category.toLocaleLowerCase("pt-BR") === categoryName.toLocaleLowerCase("pt-BR"))) {
      setError("Essa categoria já existe.");
      return;
    }

    setSaving(true);
    try {
      const created = await createCategory(categoryName);
      setCategories((current) => [...current, created].sort((a, b) => a.localeCompare(b, "pt-BR")));
      setName("");
      setFeedback(`Categoria “${created}” criada.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível criar a categoria.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={`detail-card ${styles.card}`} aria-labelledby="categories-title">
      <div className={styles.heading}>
        <span className={styles.icon}><Icon name="box" /></span>
        <div>
          <h2 id="categories-title">Categorias de produtos</h2>
          <p>Crie categorias para organizar os produtos do estoque.</p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field} htmlFor="new-category">
          <span>Nome da categoria</span>
          <input
            id="new-category"
            type="text"
            value={name}
            maxLength={80}
            autoComplete="off"
            placeholder="Ex.: Camisetas"
            onChange={(event) => {
              setName(event.target.value);
              setError("");
              setFeedback("");
            }}
          />
        </label>
        <Button type="submit" disabled={loading || saving}>
          <Icon name="plus" />
          {saving ? "Criando..." : "Criar categoria"}
        </Button>
      </form>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {feedback && <p className={styles.feedback} role="status">{feedback}</p>}
      {loadError ? (
        <div className={styles.loadError} role="alert">
          <p>{loadError}</p>
          <Button variant="secondary" onClick={() => {
            setLoading(true);
            setLoadError("");
            setRevision((value) => value + 1);
          }}>Tentar novamente</Button>
        </div>
      ) : loading ? (
        <p className={styles.status} role="status">Carregando categorias...</p>
      ) : categories.length ? (
        <ul className={styles.list} aria-label="Categorias cadastradas">
          {categories.map((category) => <li key={category}>{category}</li>)}
        </ul>
      ) : (
        <p className={styles.status}>Nenhuma categoria cadastrada.</p>
      )}
    </section>
  );
}
