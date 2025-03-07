import {StringUtil} from "./StringUtil";

export class JsonUtil {

	static reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

	static dateParser(key: string, value: any): any {
		if (typeof value === 'string' && JsonUtil.reISO.exec(value)) return new Date(value);
		return value;
	}

	static parseWithDates(json?: string | null): any {
		if (StringUtil.isBlank(json)) return undefined;
		return JSON.parse(StringUtil.getNonEmpty(json), JsonUtil.dateParser);
	}

	static parse(json?: string | null): any {
		return JsonUtil.parseWithDates(json);
	}
}
