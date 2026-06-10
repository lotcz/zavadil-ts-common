import {StringUtil} from "./StringUtil";

export class EmailUtil {

	static isValidEmail(email?: string | null): boolean {
		if (StringUtil.isBlank(email)) return false;
		return /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]{1,64}@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(email);
	}

}
