import {UserAlert, UserAlertType} from "../type";
import {EventManager, Func} from "./EventManager";

export class UserAlerts {

	private maxAlerts: number;

	private em: EventManager;

	public alerts: Array<UserAlert>;

	constructor(maxAlerts: number = 10) {
		this.maxAlerts = maxAlerts;
		this.em = new EventManager();
		this.alerts = [];
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
		while (this.alerts.length > this.maxAlerts) {
			this.alerts.shift();
		}
		this.triggerChange();
	}

	custom(type: UserAlertType, message: string) {
		this.add({
			time: new Date(),
			type: type,
			message: message
		});
	}

	err(message: string) {
		this.custom(UserAlertType.error, message);
	}

	warn(message: string) {
		this.custom(UserAlertType.warning, message);
	}

	info(message: string) {
		this.custom(UserAlertType.info, message);
	}

	getSummary(): Map<UserAlertType, number> {
		const map= new Map<UserAlertType, number>;
		const types = Object.values(UserAlertType);
		types.forEach((t, index) => {
			map.set(t, 0);
		});
		for (let i = 0; i < this.alerts.length; i++) {
			const alert = this.alerts[i];
			const n: number = map.get(alert.type) || 0;
			map.set(alert.type, n + 1);
		}
		return map;
	}

}
