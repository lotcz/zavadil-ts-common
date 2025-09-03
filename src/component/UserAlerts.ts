import {UserAlert, UserAlertType} from "../type";
import {EventManager, Func} from "./EventManager";
import {DateUtil} from "../util";

export class UserAlerts {

	private maxAlerts: number;

	public maxVisibilityMs: number;

	private em: EventManager;

	public alerts: Array<UserAlert>;

	public visibleAlerts: Array<UserAlert>;

	constructor(maxAlerts: number = 20, maxVisibilityMs: number = 7000) {
		this.maxAlerts = maxAlerts;
		this.maxVisibilityMs = maxVisibilityMs;
		this.em = new EventManager();
		this.alerts = [];
		this.visibleAlerts = [];
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
		this.visibleAlerts = [];
		this.triggerChange();
	}

	hide(alert: UserAlert) {
		this.visibleAlerts.splice(this.visibleAlerts.indexOf(alert), 1);
		this.triggerChange();
	}

	hideAll() {
		this.visibleAlerts = [];
		this.triggerChange();
	}

	updateVisibility() {
		this.visibleAlerts.forEach(
			a => {
				const elapsedMs = DateUtil.getSinceDurationMs(a.time) || this.maxVisibilityMs;
				const remainsMs = this.maxVisibilityMs - elapsedMs;
				if (remainsMs > 0) {
					a.remainsMs = remainsMs;
				} else {
					a.remainsMs = undefined;
					this.hide(a);
				}
			}
		);
		this.triggerChange();
	}

	remove(alert: UserAlert) {
		this.alerts.splice(this.alerts.indexOf(alert), 1);
		this.triggerChange();
	};

	add(alert: UserAlert) {
		if (alert.remainsMs === undefined) {
			alert.remainsMs = this.maxVisibilityMs;
		}
		this.alerts.push(alert);
		this.visibleAlerts.push(alert);
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

	err(error: string | Error) {
		this.custom(UserAlertType.error, typeof error === 'string' ? error : error.toString());
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
