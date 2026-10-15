import { getContrastRatio } from '@mui/material/styles';
import { expect, it } from 'vitest';
import { theme } from './theme.ts';
import { colors } from './design-tokens.ts';

it('keeps normal text and filled action/status labels at WCAG AA contrast', () => {
  const palette = theme.palette;
  for (const surface of [palette.background.default, palette.background.paper]) {
    expect(getContrastRatio(palette.text.primary, surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(palette.text.secondary, surface)).toBeGreaterThanOrEqual(4.5);
  }
  for (const color of [palette.primary, palette.secondary, palette.success, palette.warning, palette.error, palette.info]) {
    expect(getContrastRatio(color.contrastText, color.main)).toBeGreaterThanOrEqual(4.5);
  }
  expect(getContrastRatio(colors.controlBorder, palette.background.paper)).toBeGreaterThanOrEqual(3);
});
