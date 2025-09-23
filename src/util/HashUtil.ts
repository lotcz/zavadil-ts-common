export class HashUtil {

	static crc32hex(str: string): string {
		// Encode string to UTF-8 bytes
		const encoder = new TextEncoder();
		const data = encoder.encode(str);

		// Generate CRC32 table once
		const table = new Uint32Array(256);
		for (let i = 0; i < 256; i++) {
			let c = i;
			for (let j = 0; j < 8; j++) {
				c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
			}
			table[i] = c >>> 0;
		}

		let crc = 0 ^ -1;
		for (let i = 0; i < data.length; i++) {
			crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
		}
		crc = (crc ^ -1) >>> 0;

		return crc.toString(16);
	}
}
