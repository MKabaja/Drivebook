import type { ComponentProps } from 'react';

import { uiStyles } from '@/shared/components/ui.styles';

type FieldProps = ComponentProps<'input'> & { label: string; error?: string };

function Field({ label, error, id, name, ...props }: FieldProps) {
	const { label: labelClass, input, fieldError } = uiStyles;
	const fieldId = id ?? name;
	const errorId = `${fieldId}-error`;
	return (
		<div>
			<label className={labelClass} htmlFor={fieldId}>
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
