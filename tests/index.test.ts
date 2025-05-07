import { StringUtil } from '../src/util/StringUtil';
import {JsonUtil} from "../src/util/JsonUtil";
import {RestClient} from "../src";

describe('testing StringUtil', () => {
	test('getNonEmpty', () => {
		expect(StringUtil.getNonEmpty('test')).toBe('test');
		expect(StringUtil.getNonEmpty('', 'test')).toBe('test');
		expect(StringUtil.getNonEmpty('', null, undefined, 'test')).toBe('test');
		expect(StringUtil.getNonEmpty('', 'test', undefined, 'test2')).toBe('test');
	});
});

describe('testing JsonUtil', () => {
	test('parseWithDates', () => {
		const myObj = {
			dval: new Date(),
			sval: "str",
			nval: 13
		}
		const myStr = JSON.stringify(myObj);
		const parsed = JsonUtil.parseWithDates(myStr);

		expect(typeof parsed.dval).toBe('object');
		expect(typeof parsed.dval.getTime).toBe('function');

		expect(typeof parsed.sval).toBe('string');
		expect(parsed.sval).toBe('str');

		expect(typeof parsed.nval).toBe('number');
		expect(parsed.nval).toBe(13);
	});
});

describe('testing RestClient', () => {
	test('getUrl', () => {
		const clientAbs = new RestClient('https://localhost/rel');
		expect(clientAbs.getBaseUrl().href).toBe('https://localhost/rel/');
		expect(clientAbs.getUrl('/test').href).toBe('https://localhost/rel/test');
		expect(clientAbs.getUrl('test').href).toBe('https://localhost/rel/test');

		const clientRel = new RestClient('/rel');
		expect(clientRel.getBaseUrl().href).toBe('http://localhost/rel/');
		expect(clientRel.getUrl('/test').href).toBe('http://localhost/rel/test');
		expect(clientRel.getUrl('test').href).toBe('http://localhost/rel/test');

		const clientNoLead = new RestClient('rel/');
		expect(clientNoLead.getBaseUrl().href).toBe('http://localhost/rel/');
		expect(clientNoLead.getUrl('/test').href).toBe('http://localhost/rel/test');
		expect(clientNoLead.getUrl('test').href).toBe('http://localhost/rel/test');
	});
});
