import {CzechBasicDictionary, Dictionary, DictionaryWithFallback, EnglishBasicDictionary, TranslateParams} from "./Dictionary";

export class Localization implements Dictionary {

	private language: string | undefined;

	private dictionaries = new Map<string, Dictionary>;

	constructor(language?: string) {
		this.setLanguage(language);
	}

	addDictionary(language: string, dictionary: Dictionary) {
		const existing = this.dictionaries.get(language);
		if (existing) {
			this.dictionaries.set(language, new DictionaryWithFallback(dictionary, existing));
		} else {
			this.dictionaries.set(language, dictionary);
		}
	}

	hasDictionary(language?: string) {
		if (!language) return false;
		return this.dictionaries.has(language);
	}

	getLanguage(): string | undefined {
		return this.language;
	}

	setLanguage(language?: string) {
		this.language = language && this.hasDictionary(language)
			? language
			: this.hasDictionary(navigator.language) ? navigator.language : undefined
	}

	translate(key: string, p?: TranslateParams) {
		if (!this.language) return key;
		const d = this.dictionaries.get(this.language);
		if (!d) return key;
		const t = d.translate(key, p);
		if (t === undefined) return key;
		return t;
	}
}

export class BasicLocalization extends Localization {
	constructor(language?: string) {
		super();
		this.addDictionary("cs", new CzechBasicDictionary());
		this.addDictionary("en", new EnglishBasicDictionary());
		this.setLanguage(language);
	}
}
