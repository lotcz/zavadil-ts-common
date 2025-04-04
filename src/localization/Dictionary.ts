import CzechBasicData from './lang/dictionary.cs.json';
import EnglishBasicData from './lang/dictionary.en.json';

export type TranslateParams = {
	tags?: Array<string>;
}

export interface Dictionary {
	translate: (key: string, p?: TranslateParams) => string | undefined;
}

export type DictionaryMemoryValue = {
	tags?: Array<string>;
	value: string;
}

export interface DictionaryMemoryData {
	[key: string]:  string | Array<DictionaryMemoryValue>;
}

export class MemoryDictionary implements Dictionary {

	private data: DictionaryMemoryData;

	constructor(data: DictionaryMemoryData) {
		this.data = data;
	}

	translate(key: string, p?: TranslateParams) {
		const r = this.data[key];
		if (r === undefined || typeof r === 'string') return r;
		const def = r.find(
			(v) => (v.tags === undefined || v.tags.length === 0)
		);
		if ((p === undefined || p.tags === undefined || p.tags.length === 0) && def !== undefined) return def.value;
		const cands = r.filter(
			(v) => {
				if (v.tags === undefined || v.tags.length === 0) return false;
				return p && p.tags && p.tags.every((t) => v.tags && v.tags.includes(t));
			}
		);
		if (cands.length > 0) return cands[0].value;
		return def ? def.value : undefined;
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
