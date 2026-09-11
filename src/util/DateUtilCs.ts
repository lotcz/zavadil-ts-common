import {DateUtil} from "./DateUtil";

export class DateUtilCs {

	static formatDateForHumans(d: Date | string | null | undefined, showTime: boolean = false): string {
		d = DateUtil.parseDate(d);
		if (!d) return '';

		const year = d.getFullYear();
		const month = DateUtil.formatNumber(d.getMonth() + 1);
		const day = DateUtil.formatNumber(d.getDate());

		const date = `${day}.${month}.${year}`;

		if (!showTime) {
			return date;
		}

		const hours = DateUtil.formatNumber(d.getHours());
		const minutes = DateUtil.formatNumber(d.getMinutes());
		const seconds = DateUtil.formatNumber(d.getSeconds());
		return `${date} ${hours}:${minutes}:${seconds}`;
	}

	static formatDateTimeForHumans(d: Date | string | null | undefined): string {
		return DateUtilCs.formatDateForHumans(d, true);
	}
}
