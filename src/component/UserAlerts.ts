import {UserAlert} from "../type";
import {EventManager, Func} from "./EventManager";

export class UserAlerts {

	private lifetimeMs: number = 10000;

	private em: EventManager;

	public alerts: Array<UserAlert>;

	constructor() {
		this.em = new EventManager();
		this.alerts = [];
		setInterval(() => this.flushAlerts(), 1000)
	}

	flushAlerts() {
		const now = new Date();
		const threshold = now.getTime() - this.lifetimeMs;
		this.alerts = this.alerts.filter((a) => a.time.getTime() > threshold);
		this.triggerChange();
	}

	addOnChangeHandler(h: Func) {
		this.em.addEventListener('change', h);
	}

	removeOnChangeHandler(h: Func) {
		this.em.removeEventListener('change', h);
	}

	triggerChange() {
		this.em.triggerEvent('change');
	}

	reset() {
		this.alerts = [];
		this.triggerChange();
	}

	remove(alert: UserAlert) {
		this.alerts.splice(this.alerts.indexOf(alert), 1);
		this.triggerChange();
	};

	add(alert: UserAlert) {
		this.alerts.push(alert);
		this.triggerChange();
	}

	custom(type: string, title: string, message: string) {
		this.add({
			time: new Date(),
			type: type,
			title: title,
			message: message
		});
	}

	err(message: string) {
		this.custom('danger', 'Error', message);
	}

	warn(message: string) {
		this.custom('warning', 'Warning', message);
	}

	info(message: string) {
		this.custom('info', 'Warning', message);
	}

}
