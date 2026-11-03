import type { ComponentProps } from 'react';
import { uiStyles as s } from './ui.styles';

type FieldProps = ComponentProps<'input'> & { label: string; error?: string };
export function Field({ label, error, id, name, ...props }: FieldProps) {
  const fieldId = id ?? name;
  return (
    <label className={s.label} htmlFor={fieldId}>
      {label}
      <input
        {...props}
        id={fieldId}
        name={name}
        className={s.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
      {error && (
        <span id={`${fieldId}-error`} className={s.fieldError}>
          {error}
        </span>
      )}
    </label>
  );
}
