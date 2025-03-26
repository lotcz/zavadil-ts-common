import {CzechBasicDictionary, Dictionary, EnglishBasicDictionary, TranslateParams} from "./Dictionary";

export class Localization implements Dictionary {

	private language: string | undefined;

	private dictionaries = new Map<string, Dictionary>;

	constructor(language?: string) {
		this.setLanguage(language);
	}

	addDictionary(language: string, dictionary: Dictionary) {
		this.dictionaries.set(language, dictionary);
		this.setLanguage();
	}

	hasDictionary(language?: string) {
		if (!language) return false;
		return this.dictionaries.has(language);
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
		return d.translate(key, p);
	}
}

export class BasicLocalization extends Localization {
	constructor() {
		super();
		this.addDictionary("cs", new CzechBasicDictionary());
		this.addDictionary("en", new EnglishBasicDictionary());
	}
}
