import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Sample } from './sample';

test('テスト', () => {
  render(<Sample />);
  expect(screen.getByRole('heading', { level: 1, name: 'Sample' })).toBeDefined();
});
