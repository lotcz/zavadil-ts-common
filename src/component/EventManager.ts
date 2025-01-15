export type Func = { (arg?: any): void; }
export type FuncHandlers = Array<Func>;
export type FuncHandlersCache = Map<string, FuncHandlers>;

export class EventManager {

	handlers: FuncHandlersCache;

	constructor() {
		this.handlers = new Map<string, FuncHandlers>();
	}

	addEventListener(event: string, handler: Func) {
		if (!this.handlers.has(event)) this.handlers.set(event, []);
		// @ts-ignore
		this.handlers.get(event).push(handler);
	}

	removeEventListener(event: string, handler: Func) {
		const handlers: FuncHandlers | undefined = this.handlers.get(event);
		if (handlers) handlers.splice(handlers.indexOf(handler), 1);
	}

	triggerEvent(event: string, arg?: any) {
		if (!this.handlers.has(event)) return;
		// @ts-ignore
		this.handlers.get(event).forEach((h: Func) => h(arg));
	}

}
