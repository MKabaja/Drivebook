import { describe, expect, it } from 'vitest';

import { carSchema } from '@/features/cars/model/car.schemas';

import { makeCar, makeRentalPrice } from '@/test/factories/car.factory';

describe('makeCar', () => {
	it('builds a car that satisfies the car schema', () => {
		const car = makeCar({ price: makeRentalPrice(), is_available: true });

		expect(carSchema.parse(car)).toEqual(car);
	});
});
