import {StringUtil} from "../../util";

export class RedirectionProvider {

	private redirecting?: string;

	redirectTo(url: string): Promise<any> {
		this.redirecting = url;
		document.location.href = url;
		return Promise.reject(`Redirecting to ${url}`);
	}

	isRedirecting(): boolean {
		return StringUtil.notBlank(this.redirecting);
	}

	redirectingTo(): string {
		return StringUtil.getNonEmpty(this.redirecting);
	}

}
