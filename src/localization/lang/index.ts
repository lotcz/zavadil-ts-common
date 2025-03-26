import { readFileSync } from 'fs';
import {DictionaryMemoryData} from "../Dictionary";

export const CzechBasicData : DictionaryMemoryData = JSON.parse(readFileSync(new URL('./dictionary.cs.json', import.meta.url), 'utf8'));
export const EnglishBasicData : DictionaryMemoryData = JSON.parse(readFileSync(new URL('./dictionary.en.json', import.meta.url), 'utf8'));
