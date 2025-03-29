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

	getLanguages(): Array<string> {
		return Array.from(this.dictionaries.keys());
	}

	setLanguage(language?: string) {
		this.language = language && this.hasDictionary(language)
			? language
			: this.hasDictionary(navigator.language) ? navigator.language : undefined
	}

	translate(key: string, p?: TranslateParams, language?: string) {
		language = language ? language : this.language;
		if (!language) return key;
		const d = this.dictionaries.get(language);
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
