const CAR_ID_PATTERN = /^[1-9]\d*$/;

function parseCarId(value: string): number | undefined {
	if (!CAR_ID_PATTERN.test(value)) {
		return undefined;
	}
	return Number(value);
}

export { parseCarId };
