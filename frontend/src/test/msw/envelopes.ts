import type { Pagination } from '@/shared/api/envelopes';

type Resource<Value> = { data: Value };
type Page<Value> = { data: Value[]; links: object; meta: Pagination };

function resource<Value>(value: Value): Resource<Value> {
	return { data: value };
}

function page<Value>(
	values: Value[],
	meta: Partial<Pagination> = {},
): Page<Value> {
	return {
		data: values,
		links: {},
		meta: { current_page: 1, last_page: 1, total: values.length, ...meta },
	};
}

export { page, resource };
