import {StringUtil} from "./StringUtil";

export class UrlUtil {

	static deleteParamFromUrl(url: string, paramName: string): string {
		const urlObj = new URL(url);
		urlObj.searchParams.delete(paramName);
		return StringUtil.trimTrailingSlashes(urlObj.toString());
	}

	static extractParamFromUrl(url: string, name: string): string | null {
		const usp = new URLSearchParams(new URL(url).search);
		return usp.get(name);
	}

	static paramExistsInUrl(url: string, name: string): boolean {
		return StringUtil.notBlank(UrlUtil.extractParamFromUrl(url, name));
	}

	static extractHostFromUrl(url: string): string | null {
		if (StringUtil.isBlank(url)) return null;
		return new URL(url).host;
	}

	static extractDomainFromUrl(url: string): string | null {
		const host = UrlUtil.extractHostFromUrl(url);
		if (StringUtil.isBlank(host)) return null;
		return host.split('.').slice(-2).join('.');
	}

	static slugify(text: string): string {
		if (StringUtil.isBlank(text)) return '';
		return text
			.normalize('NFKD')                  // split accented characters into base + diacritic
			.replace(/[\u0300-\u036f]/g, '')    // remove diacritics
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, '')       // remove non-alphanumeric chars
			.replace(/[\s_-]+/g, '-')           // collapse whitespace/underscores/dashes into one dash
			.replace(/^-+|-+$/g, '');           // trim leading/trailing dashes
	}
}
