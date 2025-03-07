import { StringUtil } from '../src/util/StringUtil';
import {JsonUtil} from "../src/util/JsonUtil";

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
