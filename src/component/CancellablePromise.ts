type CancelledWrapper = { value: boolean};

export class CancellablePromise {

	isCancelled: CancelledWrapper = { value: false };

	throwWhenCancelled: boolean;

	promise: Promise<any | void>;

	constructor(promise: Promise<any | void>, throwWhenCancelled: boolean = false) {
		this.throwWhenCancelled = throwWhenCancelled;
		this.promise = new Promise(
			(resolve, reject) => {
				promise
					.then(
						result => {
							if (!this.isCancelled.value) {
								return resolve(result);
							}
						}
					)
					.catch(
						e => {
							if (this.throwWhenCancelled || !this.isCancelled.value) {
								reject(e);
							}
						}
					);
			}
		);
	}

	cancel() {
		this.isCancelled.value = true;
	}

}
