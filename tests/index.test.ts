import { StringUtil } from '../src/util/StringUtil';

describe('testing StringUtil', () => {
	test('getNonEmpty', () => {
		expect(StringUtil.getNonEmpty('test')).toBe('test');
		expect(StringUtil.getNonEmpty('', 'test')).toBe('test');
		expect(StringUtil.getNonEmpty('', null, undefined, 'test')).toBe('test');
		expect(StringUtil.getNonEmpty('', 'test', undefined, 'test2')).toBe('test');
	});
});
