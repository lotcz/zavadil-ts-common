export class StringUtil {

	static toString(s: any) {
		return typeof s === 'string' ? s : s?.toString?.() ?? '';
	}

	static isEmpty(str: string | null | undefined): boolean {
		if (typeof str !== 'string') return StringUtil.isEmpty(StringUtil.toString(str));
		return str.length === 0;
	}

	static notEmpty(str: string | null | undefined): boolean {
		return !StringUtil.isEmpty(str);
	}

	static isBlank(str: string | null | undefined): boolean {
		return StringUtil.isEmpty(StringUtil.safeTrim(str));
	}

	static notBlank(str: string | null | undefined): boolean {
		return !StringUtil.isBlank(str);
	}

	static substr(str: string | null | undefined, start: number, length?: number): string {
		if (this.isEmpty(str)) return '';

		// @ts-ignore
		return str.substring(start, length);
	}

	static replace(str: string | null | undefined, find?: null | string, replace?: string): string {
		if (this.isEmpty(str) || this.isEmpty(find)) return '';

		// @ts-ignore
		return str.replace(find, String(replace));
	}

	static containsLineBreaks(str: string | null | undefined): boolean {
		if (str === null || str === undefined || str.trim().length === 0) return false;
		return str.includes("\n");
	}

	static trimLeadingSlashes(str: string | null): string {
		if (this.isEmpty(str)) return '';

		// @ts-ignore
		return str.replace(/^\//g, '');
	}

	static trimTrailingSlashes(str: string | null): string {
		if (this.isEmpty(str)) return '';

		// @ts-ignore
		return str.replace(/\/$/g, '');
	}

	static trimSlashes(str: string | null): string {
		if (this.isEmpty(str)) return '';

		// @ts-ignore
		return str.replace(/^\/|\/$/g, '');
	}

	static safeTruncate(str: string | null | undefined, len: number, ellipsis: string = ''): string {
		if (StringUtil.isEmpty(str) || !str) return '';
		if (str.length <= len) return String(str);
		return str.substring(0, len - ellipsis.length) + ellipsis;
	}

	static ellipsis(str: string | null | undefined, len: number, ellipsis: string = '...'): string {
		return StringUtil.safeTruncate(str, len, ellipsis);
	}

	static safeTrim(str: string | null | undefined): string {
		if (StringUtil.isEmpty(str) || !str) return '';
		return str.trim();
	}

	static safeLowercase(str: string | null | undefined): string {
		if (StringUtil.isEmpty(str) || !str) return '';
		return str.toLowerCase();
	}

	static safeUppercase(str: string | null | undefined): string {
		if (StringUtil.isEmpty(str) || !str) return '';
		return str.toUpperCase();
	}

	static toBigInt(str: string | null): bigint | null {
		if (this.isEmpty(str)) return null;

		// @ts-ignore
		return BigInt(str);
	}

	static getNonEmpty(...args: Array<string | null | undefined>): string {
		return args.find(a => StringUtil.notEmpty(a)) || "";
	}

	static getNonBlank(...args: Array<string | null | undefined>): string {
		return args.find(a => StringUtil.notBlank(a)) || "";
	}

	static emptyToNull(str: string | null | undefined): string | null {
		return StringUtil.isEmpty(str) ? null : String(str);
	}

	static blankToNull(str: string | null | undefined): string | null {
		return StringUtil.isBlank(str) ? null : String(str);
	}

}
