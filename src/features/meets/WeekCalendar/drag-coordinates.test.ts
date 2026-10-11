import { expect, it, vi } from 'vitest';
import { calendarKeyboardCoordinates, slotCollision } from './drag-coordinates.ts';

it('moves a keyboard drag in 15 minute steps and by a full day column', () => {
  const context = { currentCoordinates: { x: 10, y: 72 }, context: { droppableRects: new Map([['slot', { width: 120 }]]) } } as unknown as Parameters<typeof calendarKeyboardCoordinates>[1];
  const event = (code: string) => ({ code, preventDefault: vi.fn() }) as unknown as KeyboardEvent;
  expect(calendarKeyboardCoordinates(event('ArrowDown'), context)).toEqual({ x: 10, y: 90 });
  expect(calendarKeyboardCoordinates(event('ArrowUp'), context)).toEqual({ x: 10, y: 54 });
  expect(calendarKeyboardCoordinates(event('ArrowRight'), context)).toEqual({ x: 130, y: 72 });
  expect(calendarKeyboardCoordinates(event('ArrowLeft'), context)).toEqual({ x: -110, y: 72 });
  expect(calendarKeyboardCoordinates(event('Escape'), context)).toBeUndefined();
});

it('targets the start of a long meeting and ignores disabled or out of week drop zones', () => {
  const args = { collisionRect: { left: 4, top: 18, width: 112, height: 144 },
    droppableRects: new Map([['first', { left: 0, right: 120, top: 18, bottom: 36 }], ['second', { left: 120, right: 240, top: 18, bottom: 36 }]]),
    droppableContainers: [{ id: 'first', disabled: false }, { id: 'second', disabled: false }],
  } as unknown as Parameters<typeof slotCollision>[0];
  expect(slotCollision(args)).toEqual([{ id: 'first' }]);
  expect(slotCollision({ ...args, collisionRect: { ...args.collisionRect, left: 124 } })).toEqual([{ id: 'second' }]);
  expect(slotCollision({ ...args, collisionRect: { ...args.collisionRect, left: 244 } })).toEqual([]);
  expect(slotCollision({ ...args, droppableContainers: args.droppableContainers.map(container => ({ ...container, disabled: true })) })).toEqual([]);
});
