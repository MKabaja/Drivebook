import { useNavigate } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';

import { Field } from '@/shared/components/field/field';
import { BOOKING_HORIZON_DAYS, MAX_RENTAL_DAYS } from '@/shared/config';
import { addDays } from '@/shared/lib/add-days';
import { uiStyles } from '@/shared/styles/ui.styles';
import {
	findRentalDatesError,
	type RentalDateField,
	type RentalDatesError,
} from '@/features/cars/lib/find-rental-dates-error';
import { isCalendarDate } from '@/features/cars/lib/is-calendar-date';
import type {
	CarSearch,
	RentalDatesSearch,
} from '@/features/cars/model/car-search.schemas';

import { carDetailsStyles } from './car-details.styles';

type CarDetailsRentalDateFormProps = {
	carId: number;
	search: CarSearch;
	today: string;
};
type RentalDateValues = Record<RentalDateField, string>;
type RentalDatesDraft = {
	sourceKey: string;
	values: RentalDateValues;
	error?: RentalDatesError;
};

function CarDetailsRentalDateForm({
	carId,
	search,
	today,
}: CarDetailsRentalDateFormProps) {
	const { secondary } = uiStyles;
	const { dateForm, dateFields } = carDetailsStyles;
	const navigate = useNavigate();
	const urlValues: RentalDateValues = {
		starts_on: search.starts_on ?? '',
		ends_on: search.ends_on ?? '',
	};
	const urlKey = `${urlValues.starts_on}/${urlValues.ends_on}`;
	const [draft, setDraft] = useState<RentalDatesDraft>({
		sourceKey: urlKey,
		values: urlValues,
	});
	const isDraftCurrent = draft.sourceKey === urlKey;
	const values = isDraftCurrent ? draft.values : urlValues;
	const error = isDraftCurrent ? draft.error : undefined;
	const earliestPickup = addDays(today, 1);
	const pickupForLimits = isCalendarDate(values.starts_on)
		? values.starts_on
		: earliestPickup;

	function updateValue(field: RentalDateField, value: string) {
		setDraft({ sourceKey: urlKey, values: { ...values, [field]: value } });
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const dates = toRentalDates(values);
		const datesError =
			findRentalDatesError(dates, today) ?? findMissingDate(dates);
		if (datesError) {
			setDraft({ sourceKey: urlKey, values, error: datesError });
			focusControl(event.currentTarget, datesError.field);
			return;
		}
		await navigate({
			to: '/cars/$carId',
			params: { carId: String(carId) },
			search: { ...search, ...dates },
			resetScroll: false,
		});
	}

	return (
		<form
			onSubmit={handleSubmit}
			className={dateForm}
			aria-label="Rental dates"
			noValidate
		>
			<div className={dateFields}>
				<Field
					label="Pick-up date"
					name="starts_on"
					type="date"
					min={earliestPickup}
					max={addDays(today, BOOKING_HORIZON_DAYS)}
					value={values.starts_on}
					onChange={(event) => updateValue('starts_on', event.target.value)}
					error={error?.field === 'starts_on' ? error.message : undefined}
				/>
				<Field
					label="Return date"
					name="ends_on"
					type="date"
					min={addDays(pickupForLimits, 1)}
					max={addDays(pickupForLimits, MAX_RENTAL_DAYS)}
					value={values.ends_on}
					onChange={(event) => updateValue('ends_on', event.target.value)}
					error={error?.field === 'ends_on' ? error.message : undefined}
				/>
			</div>
			<button type="submit" className={secondary}>
				Check price
			</button>
		</form>
	);
}

function toRentalDates(values: RentalDateValues): RentalDatesSearch {
	return {
		starts_on: isCalendarDate(values.starts_on) ? values.starts_on : undefined,
		ends_on: isCalendarDate(values.ends_on) ? values.ends_on : undefined,
	};
}

function findMissingDate(
	dates: RentalDatesSearch,
): RentalDatesError | undefined {
	if (dates.starts_on === undefined) {
		return { field: 'starts_on', message: 'Choose a pick-up date.' };
	}
	return undefined;
}

function focusControl(form: HTMLFormElement, name: RentalDateField) {
	const control = form.elements.namedItem(name);
	if (control instanceof HTMLInputElement) {
		control.focus();
	}
}

export { CarDetailsRentalDateForm };
