import { sum } from '@/utils/sum';
import { expect, test } from 'vitest';

test('1+1=2', () => {
  expect(sum(1, 1)).toBe(2);
});
