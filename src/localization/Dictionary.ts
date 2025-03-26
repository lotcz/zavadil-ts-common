import {CzechBasicData, EnglishBasicData} from './lang';

export type TranslateParams = {
	tags?: Array<string>;
}

export interface Dictionary {
	translate: (key: string, p?: TranslateParams) => string | undefined;
}

export interface DictionaryMemoryData {
	[key: string]: string;
}

export class MemoryDictionary implements Dictionary {

	private data: DictionaryMemoryData;

	constructor(data: DictionaryMemoryData) {
		this.data = data;

	}

	translate(key: string, p?: TranslateParams) {
		return this.data[key];
	};

}

export class CzechBasicDictionary extends MemoryDictionary {
	constructor() {
		super(CzechBasicData);
	}
}

export class EnglishBasicDictionary extends MemoryDictionary {
	constructor() {
		super(EnglishBasicData);
	}
}

export class DictionaryWithFallback implements Dictionary {

	private primary: Dictionary;

	private fallback: Dictionary;

	constructor(primary: Dictionary, fallback: Dictionary) {
		this.primary = primary;
		this.fallback = fallback;
	}

	translate(key: string, p?: TranslateParams) {
		const pt = this.primary.translate(key, p);
		if (pt === undefined) return this.fallback.translate(key, p);
		return pt;
	};
}
