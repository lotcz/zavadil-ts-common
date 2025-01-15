import {StringUtil} from "../util";

export class OAuthSubject {

	private value: string;

	public constructor(value: string) {
		this.value = value;
	}

	public getSubjectType(): string | null{
		if (StringUtil.isEmpty(this.value)) return null;
		return this.value.split(':')[0];
	}

	public getSubjectContent(): string | null {
		if (StringUtil.isEmpty(this.value)) return null;
		const arr = this.value.split('//');
		return (arr.length > 1) ? arr[1] : null;
	}

	public toString(): string {
		return this.value;
	}
}
