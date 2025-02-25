import {ObjectUtil} from "./ObjectUtil";

export class DateUtil {

	static formatNumber(n: number, digits = 2) {
		const s = String(n);
		return s.padStart(digits, '0');
	}

	static parseDate(d: Date | string | null | undefined): Date | undefined {
		if (!d) return undefined;
		if (typeof d === 'string') {
			return new Date(d);
		}
		return d;
	}

	static formatDateForHumans(d: Date | string | null | undefined, showTime = false): string {
		d = DateUtil.parseDate(d);
		if (!d) return "";

		const year = d.getFullYear();
		const month = DateUtil.formatNumber(d.getMonth() + 1);
		const day = DateUtil.formatNumber(d.getDate());

		const date = `${year}-${month}-${day}`
		if (!showTime) {
			return date;
		}

		const hours = DateUtil.formatNumber(d.getHours());
		const minutes = DateUtil.formatNumber(d.getMinutes());
		const seconds = DateUtil.formatNumber(d.getSeconds());
		return `${date} ${hours}:${minutes}:${seconds}`;
	}

	static formatDateTimeForHumans(d: Date | string | null | undefined): string {
		return DateUtil.formatDateForHumans(d, true);
	}

	static formatDateForInput(d: any): string {
		const date = DateUtil.parseDate(d);
		if (date === undefined) return '';
		const year = date.getFullYear();
		const month = DateUtil.formatNumber(date.getMonth() + 1);
		const day = DateUtil.formatNumber(date.getDate());
		return `${year}-${month}-${day}`;
	}

	static getDurationMs(d1?: Date | string | null, d2?: Date | string | null): number | null {
		d1 = DateUtil.parseDate(d1);
		d2 = DateUtil.parseDate(d2);
		if (ObjectUtil.isEmpty(d1) || ObjectUtil.isEmpty(d2)) return null;
		try {
			// @ts-ignore
			return d2.getTime() - d1.getTime();
		} catch (e) {
			return null;
		}
	}

	static getSinceDurationMs(d1?: Date | string | null): number | null {
		return DateUtil.getDurationMs(d1, new Date());
	}

	static formatDuration(ms?: number | null): string {
		if (!ms) {
			return '';
		}

		let secs = Math.floor(ms / 1000);
		ms -= secs * 1000;
		let mins = Math.floor(secs / 60);
		secs -= mins * 60;
		let hrs = Math.floor(mins / 60);
		mins -= hrs * 60;
		let days = Math.floor(hrs / 24);
		hrs -= days * 24;

		const items = [];
		if (days > 0) items.push(`${days}d`);
		if (hrs > 0) items.push(`${hrs}h`);
		if (mins > 0) items.push(`${mins}m`);
		if (secs > 0 && days === 0 && hrs === 0) items.push(`${secs}s`);
		if (ms > 0 && days === 0 && hrs === 0 && mins === 0) items.push(`${ms}ms`);

		return items.join(' ');
	}
}
