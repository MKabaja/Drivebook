import type { ComponentProps } from 'react';

import { uiStyles } from '@/shared/styles/ui.styles';

type FieldProps = ComponentProps<'input'> & { label: string; error?: string };

function Field({ label, error, id, name, ...props }: FieldProps) {
	const { fieldLabel, input, fieldError } = uiStyles;
	const fieldId = id ?? name;
	const errorId = `${fieldId}-error`;
	return (
		<div>
			<label className={fieldLabel} htmlFor={fieldId}>
				{label}
			</label>
			<input
				{...props}
				id={fieldId}
				name={name}
				className={input}
				aria-invalid={error ? true : undefined}
				aria-describedby={error ? errorId : undefined}
			/>
			{error && (
				<p id={errorId} className={fieldError}>
					{error}
				</p>
			)}
		</div>
	);
}

export { Field };
