import { BUTTON_CASES } from './button';
import { INPUT_CASES } from './input';

export * from './types';

export const PARITY_CASES = [...BUTTON_CASES, ...INPUT_CASES];
export const DEFAULT_CASE_ID = PARITY_CASES[0].id;
