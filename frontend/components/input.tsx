"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "./input.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  trailing?: ReactNode;
  error?: string;
};

export default function Input({ label, trailing, error, id, className = "", "aria-describedby": describedBy, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const description = [describedBy, error ? errorId : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <div className={styles.control} data-invalid={Boolean(error)}>
        <input id={inputId} className={`${styles.input} ${className}`} aria-invalid={error ? true : undefined} aria-describedby={description} {...props} />
        {trailing && <span className={styles.trailing}>{trailing}</span>}
      </div>
      {error && <p id={errorId} className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
