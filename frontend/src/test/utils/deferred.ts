type Deferred<Value> = {
	promise: Promise<Value>;
	resolve: (value: Value) => void;
};

/**
 * Creates a promise the test resolves by hand, to hold an MSW handler's response
 * until a chosen moment (`await deferred.promise` inside the handler).
 */
function createDeferred<Value = void>(): Deferred<Value> {
	let resolve: (value: Value) => void = () => {};
	const promise = new Promise<Value>((resolvePromise) => {
		resolve = resolvePromise;
	});
	return { promise, resolve };
}

export { createDeferred };
