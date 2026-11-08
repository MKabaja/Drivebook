import { Link, useNavigate } from '@tanstack/react-router';
import { Search, SlidersHorizontal } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { Field } from '@/shared/components/field/field';
import {
	BOOKING_HORIZON_DAYS,
	MAX_RENTAL_DAYS,
	PICKUP_TIME,
} from '@/shared/config';
import { addDays } from '@/shared/lib/add-days';
import { uiStyles } from '@/shared/styles/ui.styles';
import {
	findRentalDatesError,
	type RentalDatesError,
} from '@/features/cars/lib/find-rental-dates-error';
import { isCalendarDate } from '@/features/cars/lib/is-calendar-date';
import { toCarFilters } from '@/features/cars/lib/to-car-filters';
import { toCarSearch } from '@/features/cars/lib/to-car-search';
import {
	labelByTransmission,
	SEAT_OPTIONS,
} from '@/features/cars/model/car.constants';
import type {
	CarFilterField,
	CarFilterValues,
	CarSearch,
} from '@/features/cars/model/car-search.schemas';

import { carFiltersStyles } from './car-filters.styles';

type CarFiltersProps = { search: CarSearch; today: string };
type FiltersDraft = {
	sourceKey: string;
	values: CarFilterValues;
	error?: RentalDatesError;
};

function CarFilters({ search, today }: CarFiltersProps) {
	const { panel, fieldLabel, input, primary } = uiStyles;
	const { form, heading, grid, footer, clearLink } = carFiltersStyles;
	const navigate = useNavigate();
	const urlValues = toCarFilters(search);
	const urlKey = JSON.stringify(search);
	const [draft, setDraft] = useState<FiltersDraft>({
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

	function updateValue(field: CarFilterField, value: string) {
		setDraft({ sourceKey: urlKey, values: { ...values, [field]: value } });
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const nextSearch = toCarSearch(values);
		const datesError = findRentalDatesError(nextSearch, today);
		if (datesError) {
			setDraft({ sourceKey: urlKey, values, error: datesError });
			focusControl(event.currentTarget, datesError.field);
			return;
		}
		await navigate({ to: '/cars', search: nextSearch });
	}

	return (
		<form
			onSubmit={handleSubmit}
			className={`${panel} ${form}`}
			aria-labelledby="car-filters-title"
		>
			<h2 id="car-filters-title" className={heading}>
				<SlidersHorizontal size={18} aria-hidden="true" />
				Find a car for your plans
			</h2>
			<div className={grid}>
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
				<label className={fieldLabel}>
					Seats
					<select
						name="seats"
						value={values.seats}
						onChange={(event) => updateValue('seats', event.target.value)}
						className={input}
					>
						<option value="">Any</option>
						{SEAT_OPTIONS.map((seats) => (
							<option key={seats} value={seats}>
								{seats}+
							</option>
						))}
					</select>
				</label>
				<label className={fieldLabel}>
					Transmission
					<select
						name="transmission"
						value={values.transmission}
						onChange={(event) =>
							updateValue('transmission', event.target.value)
						}
						className={input}
					>
						<option value="">Any</option>
						<option value="automatic">{labelByTransmission.automatic}</option>
						<option value="manual">{labelByTransmission.manual}</option>
					</select>
				</label>
				<button type="submit" className={primary}>
					<Search size={17} aria-hidden="true" />
					Search
				</button>
			</div>
			<div className={footer}>
				<p>
					Pick-up and return at {PICKUP_TIME} (Warsaw time) · priced per full
					day
				</p>
				<Link to="/cars" className={clearLink}>
					Clear filters
				</Link>
			</div>
		</form>
	);
}

function focusControl(form: HTMLFormElement, name: CarFilterField) {
	const control = form.elements.namedItem(name);
	if (control instanceof HTMLInputElement) {
		control.focus();
	}
}

export { CarFilters };
