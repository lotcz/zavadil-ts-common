import {StringUtil} from "./StringUtil";

export default class UrlUtil {

	static deleteParamFromUrl(url: string, paramName: string): string {
		const urlObj = new URL(url);
		urlObj.searchParams.delete(paramName);
		return StringUtil.trimTrailingSlashes(url.toString());
	}

	static extractParamFromUrl(url: string, name: string): string | null {
		const usp = new URLSearchParams(new URL(url).search);
		return usp.get(name);
	}

	static paramExistsInUrl(url: string, name: string): boolean {
		return StringUtil.notBlank(UrlUtil.extractParamFromUrl(url, name));
	}
}
