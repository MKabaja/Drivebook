type Deferred<Value> = {
	promise: Promise<Value>;
	resolve: (value: Value) => void;
};

/**
 * Tworzy obietnicę rozwiązywaną ręcznie w teście, by wstrzymać odpowiedź handlera MSW
 * w wybranym momencie (`await deferred.promise` w handlerze).
 */
function createDeferred<Value = void>(): Deferred<Value> {
	let resolve: (value: Value) => void = () => {};
	const promise = new Promise<Value>((resolvePromise) => {
		resolve = resolvePromise;
	});
	return { promise, resolve };
}

export { createDeferred };
