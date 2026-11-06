type Resource<Value> = { data: Value };

function resource<Value>(value: Value): Resource<Value> {
	return { data: value };
}

export { resource };
