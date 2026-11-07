import type {
	CarCategory,
	Transmission,
} from '@/features/cars/model/car.schemas';

type LabelByTransmission = Record<Transmission, string>;
type LabelByCategory = Record<CarCategory, string>;

const SEAT_OPTIONS = [2, 4, 5, 7] as const;

const labelByTransmission: LabelByTransmission = {
	automatic: 'Automatic',
	manual: 'Manual',
};

const labelByCategory: LabelByCategory = {
	sport: 'Sport',
	grand_tourer: 'Grand tourer',
	muscle: 'Muscle car',
	sedan: 'Sedan',
	estate: 'Estate',
};

export { labelByCategory, labelByTransmission, SEAT_OPTIONS };
