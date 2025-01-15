export class ByteUtil {

	static formatByteSize(size?: number | null): string {
		const n = Number(size);
		if (n === null || Number.isNaN(n)) return '';
		if (n === 0) return '0';
		const l = Math.floor(Math.log(n) / Math.log(1024));
		return +((n / Math.pow(1024, l)).toFixed(2)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][l];
	}

}
