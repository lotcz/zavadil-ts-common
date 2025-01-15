export class AsyncUtil {
	static sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
}
